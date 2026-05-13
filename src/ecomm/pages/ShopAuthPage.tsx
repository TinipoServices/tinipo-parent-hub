import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useShopAuth } from "../context/ShopAuthContext";
import type { CustomerAddress, ShopUser } from "../types";
import { isEcommMockMode } from "../api/config";
import { AddressBook } from "../components/AddressBook";

const emptyAddress = (): CustomerAddress => ({
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
});

export default function ShopAuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/shop/products";

  const {
    user,
    signOut,
    updateProfile,
    isSendingOtp,
    isValidating,
    sendSignupOtp,
    sendLoginOtp,
    completeSignupWithOtp,
    completeLoginWithOtp,
  } = useShopAuth();

  const [signupStep, setSignupStep] = useState<"form" | "otp">("form");
  const [loginStep, setLoginStep] = useState<"phone" | "otp">("phone");

  const [signupProfile, setSignupProfile] = useState<ShopUser>({
    name: "",
    phone: "",
    address: emptyAddress(),
  });

  const [loginPhone, setLoginPhone] = useState("");
  const [otpSignup, setOtpSignup] = useState("");
  const [otpLogin, setOtpLogin] = useState("");

  if (user) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="font-display">My account</CardTitle>
            <CardDescription>Manage your name, addresses, and order history.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Phone</span>
              <p className="font-medium">{user.phone}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={user.name}
                onChange={(e) => updateProfile({ ...user, name: e.target.value })}
              />
            </div>
            <AddressBook />
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => signOut()}>
                Sign out
              </Button>
              <Button type="button" onClick={() => navigate(next)}>
                Continue shopping
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate("/shop/orders")}>
                Order history
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSignupSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone, address } = signupProfile;
    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone are required.");
      return;
    }
    if (!address.line1.trim() || !address.city.trim() || !address.state.trim() || !address.pincode.trim()) {
      toast.error("Please complete all required address fields.");
      return;
    }
    try {
      await sendSignupOtp(signupProfile);
      setSignupStep("otp");
      toast.success("OTP sent to your phone.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send OTP.");
    }
  };

  const handleSignupVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpSignup.length !== 6) {
      toast.error("Enter the 6-digit OTP.");
      return;
    }
    try {
      await completeSignupWithOtp(signupProfile.phone, otpSignup, signupProfile);
      toast.success("Welcome to Tinipo Shop!");
      navigate(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP.");
    }
  };

  const handleLoginSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      toast.error("Enter your phone number.");
      return;
    }
    try {
      await sendLoginOtp(loginPhone.trim());
      setLoginStep("otp");
      toast.success("OTP sent to your phone.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send OTP.");
    }
  };

  const handleLoginVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpLogin.length !== 6) {
      toast.error("Enter the 6-digit OTP.");
      return;
    }
    try {
      await completeLoginWithOtp(loginPhone.trim(), otpLogin);
      toast.success("Signed in.");
      navigate(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid OTP.");
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {isEcommMockMode() && (
        <Alert>
          <AlertTitle>Preview mode</AlertTitle>
          <AlertDescription>
            Catalog and orders use dummy data. After requesting an OTP, enter any <strong>6 digits</strong> to continue.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="signup" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-11">
          <TabsTrigger value="signup">Sign up</TabsTrigger>
          <TabsTrigger value="login">Log in</TabsTrigger>
        </TabsList>

        <TabsContent value="signup" className="mt-6">
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-xl">Create an account</CardTitle>
              <CardDescription>Name, phone, delivery address, then verify with OTP.</CardDescription>
            </CardHeader>
            <CardContent>
              {signupStep === "form" ? (
                <form onSubmit={handleSignupSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="su-name">Full name</Label>
                    <Input
                      id="su-name"
                      value={signupProfile.name}
                      onChange={(e) => setSignupProfile((p) => ({ ...p, name: e.target.value }))}
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-phone">Phone</Label>
                    <Input
                      id="su-phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="+91 …"
                      value={signupProfile.phone}
                      onChange={(e) => setSignupProfile((p) => ({ ...p, phone: e.target.value }))}
                      autoComplete="tel"
                      required
                    />
                  </div>
                  <p className="text-sm font-medium text-foreground pt-2">Delivery address</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="su-a1">Line 1</Label>
                      <Input
                        id="su-a1"
                        value={signupProfile.address.line1}
                        onChange={(e) =>
                          setSignupProfile((p) => ({
                            ...p,
                            address: { ...p.address, line1: e.target.value },
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="su-a2">Line 2 (optional)</Label>
                      <Input
                        id="su-a2"
                        value={signupProfile.address.line2 ?? ""}
                        onChange={(e) =>
                          setSignupProfile((p) => ({
                            ...p,
                            address: { ...p.address, line2: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-city">City</Label>
                      <Input
                        id="su-city"
                        value={signupProfile.address.city}
                        onChange={(e) =>
                          setSignupProfile((p) => ({
                            ...p,
                            address: { ...p.address, city: e.target.value },
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-state">State</Label>
                      <Input
                        id="su-state"
                        value={signupProfile.address.state}
                        onChange={(e) =>
                          setSignupProfile((p) => ({
                            ...p,
                            address: { ...p.address, state: e.target.value },
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="su-pin">PIN code</Label>
                      <Input
                        id="su-pin"
                        inputMode="numeric"
                        value={signupProfile.address.pincode}
                        onChange={(e) =>
                          setSignupProfile((p) => ({
                            ...p,
                            address: { ...p.address, pincode: e.target.value },
                          }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isSendingOtp}>
                    {isSendingOtp ? "Sending OTP…" : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignupVerify} className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Enter the code sent to <span className="font-medium text-foreground">{signupProfile.phone}</span>
                  </p>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otpSignup} onChange={setOtpSignup}>
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:flex-1"
                      onClick={() => {
                        setSignupStep("form");
                        setOtpSignup("");
                      }}
                    >
                      Back
                    </Button>
                    <Button type="submit" className="w-full sm:flex-1" disabled={isValidating}>
                      {isValidating ? "Verifying…" : "Verify & sign up"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login" className="mt-6">
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-xl">Log in</CardTitle>
              <CardDescription>Phone number and OTP verification.</CardDescription>
            </CardHeader>
            <CardContent>
              {loginStep === "phone" ? (
                <form onSubmit={handleLoginSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lg-phone">Phone</Label>
                    <Input
                      id="lg-phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="+91 …"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      autoComplete="tel"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isSendingOtp}>
                    {isSendingOtp ? "Sending OTP…" : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLoginVerify} className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Code sent to <span className="font-medium text-foreground">{loginPhone}</span>
                  </p>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otpLogin} onChange={setOtpLogin}>
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:flex-1"
                      onClick={() => {
                        setLoginStep("phone");
                        setOtpLogin("");
                      }}
                    >
                      Back
                    </Button>
                    <Button type="submit" className="w-full sm:flex-1" disabled={isValidating}>
                      {isValidating ? "Verifying…" : "Verify & log in"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-center text-xs text-muted-foreground">
        <Link to="/privacy-policy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
