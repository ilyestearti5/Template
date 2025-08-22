import React from "react";
import { Translate } from "@biqpod/app/ui/components";

const PrivacyPolicy: React.FC = () => (
  <div className="mx-auto px-4 py-10 max-w-2xl">
    <h1 className="mb-6 font-bold text-3xl">
      <Translate content="Privacy Policy" />
    </h1>
    <p className="mb-4">
      <Translate content="We value your privacy and are committed to protecting your personal information. This app collects and stores the following data to provide a seamless shopping experience:" />
    </p>
    <ul className="mb-4 pl-6 list-disc">
      <li>
        <strong>
          <Translate content="Account Information:" />
        </strong>{" "}
        <Translate content="Name, email, phone number, and" />
        <Translate content="address for order processing and delivery." />
      </li>
      <li>
        <strong>
          <Translate content="Cart & Favorites:" />
        </strong>{" "}
        <Translate content="Products you add to your cart and" />
        <Translate content="mark as favorites are saved locally and securely." />
      </li>
      <li>
        <strong>
          <Translate content="Order History:" />
        </strong>{" "}
        <Translate content="Your previous orders are stored to help" />
        <Translate content="you track purchases and reorder easily." />
      </li>
      <li>
        <strong>
          <Translate content="Location Data:" />
        </strong>{" "}
        <Translate content="If you enable location, we use it to" />
        <Translate content="suggest nearby stores and delivery options. Location is never shared with third parties." />
      </li>
      <li>
        <strong>
          <Translate content="Device Info:" />
        </strong>{" "}
        <Translate content="Basic device data (browser, OS) for app" />
        <Translate content="optimization and troubleshooting." />
      </li>
    </ul>
    <p className="mb-4">
      <Translate content="We do" />{" "}
      <strong>
        <Translate content="not" />
      </strong>{" "}
      <Translate content="sell or share your personal data with third" />
      <Translate content="parties. All sensitive information is encrypted and stored securely. You can request deletion of your account and data at any time." />
    </p>
    <p>
      <Translate content="If you have questions about your privacy, contact us via the app support page." />
    </p>
  </div>
);

export default PrivacyPolicy;
