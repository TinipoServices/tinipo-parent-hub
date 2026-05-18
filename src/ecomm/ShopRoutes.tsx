import { Navigate, Route, Routes } from "react-router-dom";
import { EcommLayout } from "./components/EcommLayout";
import ShopProductsPage from "./pages/ShopProductsPage";
import ShopProductDetailPage from "./pages/ShopProductDetailPage";
import ShopCategoryPage from "./pages/ShopCategoryPage";
import ShopAuthPage from "./pages/ShopAuthPage";
import ShopCheckoutPage from "./pages/ShopCheckoutPage";
import ShopOrdersPage from "./pages/ShopOrdersPage";
import ShopOrderDetailPage from "./pages/ShopOrderDetailPage";

export function ShopRoutes() {
  return (
    <Routes>
      <Route element={<EcommLayout />}>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products/:productId" element={<ShopProductDetailPage />} />
        <Route path="products" element={<ShopProductsPage />} />
        <Route path="c/:categoryId" element={<ShopCategoryPage />} />
        <Route path="sign-in" element={<ShopAuthPage />} />
        <Route path="checkout" element={<ShopCheckoutPage />} />
        <Route path="orders" element={<ShopOrdersPage />} />
        <Route path="orders/:orderId" element={<ShopOrderDetailPage />} />
      </Route>
    </Routes>
  );
}
