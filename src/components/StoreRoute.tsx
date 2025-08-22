import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
} from "react-router-dom";
import { initCart, initCustomer, initFavorites } from "../hooks";
import { CustomCartView } from "./CartPage";
import { FavoritesPage } from "./FavoritesPage";
import { HomePage, langSettingId } from "./HomePage";
import { OfferPage } from "./OfferPage";
import { LoadingProgressBar } from "./LoadingProgressBar";
import { CollectionPage } from "./CollectionPage";
import { SearchPage } from "./Search";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfService from "./TermsOfService";
import {
  initLangs,
  setSettingValue,
  useSettingValue,
} from "@biqpod/app/ui/hooks";
import { useEffect } from "react";
import { BRAND_COLOR } from "./utils";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { BrandPage } from "./BrandPage";
import { ClientSignIn } from "./ClientSignIn";
import { CookiePolicy } from "./CookiePolicy";
// Search Products Page Component
export const StoreRoute = () => {
  initCart();
  initFavorites();
  initLangs();
  useEffect(() => {
    // set status bar color
    const color = BRAND_COLOR;
    if (Capacitor.isNativePlatform()) {
      (async () => {
        try {
          await StatusBar.setOverlaysWebView({ overlay: false });
        } catch {}
        try {
          await StatusBar.setBackgroundColor({ color });
        } catch {}
        try {
          await StatusBar.setStyle({ style: Style.Dark });
        } catch {}
      })();
    } else {
      const ensureMeta = (name: string, content: string) => {
        let el = document.querySelector<HTMLMetaElement>(
          `meta[name="${name}"]`
        );
        if (!el) {
          el = document.createElement("meta");
          el.setAttribute("name", name);
          document.head.appendChild(el);
        }
        el.setAttribute("content", content);
      };
      ensureMeta("theme-color", color);
      // iOS Safari status bar style hint when added to home screen
      ensureMeta("apple-mobile-web-app-status-bar-style", "default");
    }
  }, []);
  const langSetting = useSettingValue(langSettingId);
  useEffect(() => {
    document.body.setAttribute("lang-id", langSetting?.toString() || "en");
  }, [langSetting]);
  const loc = useLocation();
  useEffect(() => {
    const searchParams = new URLSearchParams(loc.search);
    const lang = searchParams.get("lang");
    if (lang && ["en", "fr", "ar"].includes(lang)) {
      setSettingValue(langSettingId, lang);
    }
  }, [loc.search]);
  initCustomer();
  return (
    <div className="h-full overflow-y-auto">
      <Router>
        <div className="bg-gray-50 min-h-screen">
          {/* Global Loading Progress Bar */}
          <LoadingProgressBar />
          <Switch>
            <Route exact path="/">
              <HomePage />
            </Route>
            <Route path="/brand/:brandId">
              <BrandPage />
            </Route>
            <Route path="/search">
              <SearchPage />
            </Route>
            <Route path="/collection/:collectionId">
              <CollectionPage />
            </Route>
            <Route path="/offer/:offerId">
              <OfferPage />
            </Route>
            <Route path="/client-signin">
              <ClientSignIn />
            </Route>
            <Route path="/cart">
              <CustomCartView />
            </Route>
            <Route path="/favorites">
              <FavoritesPage />
            </Route>
            <Route path="/privacy-policy">
              <PrivacyPolicy />
            </Route>
            <Route path="/terms-of-service">
              <TermsOfService />
            </Route>
            <Route path="/cookie-policy">
              <CookiePolicy />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
};
