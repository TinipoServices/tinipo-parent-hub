import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useShopAuth } from "../context/ShopAuthContext";
import { AddressBook } from "../components/AddressBook";

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
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
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
              <p className="font-medium">{String(user.phone_no ?? user.phone ?? "")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={user.name}
                onChange={(e) => updateProfile({ name: e.target.value })}
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
    if (!signupName.trim() || !signupPhone.trim()) {
      toast.error("Name and phone are required.");
      return;
    }
    try {
      await sendSignupOtp({ name: signupName.trim(), phone: signupPhone.trim() });
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
      await completeSignupWithOtp(signupPhone.trim(), otpSignup, { name: signupName.trim() });
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
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-11">
          <TabsTrigger value="login">Log in</TabsTrigger>
          <TabsTrigger value="signup">Sign up</TabsTrigger>
        </TabsList>

        <TabsContent value="signup" className="mt-6">
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-xl">Create an account</CardTitle>
              <CardDescription>Name and phone, then verify with OTP.</CardDescription>
            </CardHeader>
            <CardContent>
              {signupStep === "form" ? (
                <form onSubmit={handleSignupSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="su-name">Full name</Label>
                    <Input id="su-name" value={signupName} onChange={(e) => setSignupName(e.target.value)} autoComplete="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-phone">Phone</Label>
                    <Input
                      id="su-phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit number"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      autoComplete="tel"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isSendingOtp}>
                    {isSendingOtp ? "Sending OTP…" : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignupVerify} className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Enter the code sent to <span className="font-medium text-foreground">{signupPhone}</span>
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
                    <Button type="button" variant="outline" className="w-full sm:flex-1" onClick={() => { setSignupStep("form"); setOtpSignup(""); }}>
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
                      placeholder="10-digit number"
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
                    <Button type="button" variant="outline" className="w-full sm:flex-1" onClick={() => { setLoginStep("phone"); setOtpLogin(""); }}>
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
