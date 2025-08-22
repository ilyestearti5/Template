import React from "react";
import { Translate } from "@biqpod/app/ui/components";

const TermsOfService: React.FC = () => (
  <div className="mx-auto px-4 py-10 max-w-2xl">
    <h1 className="mb-6 font-bold text-3xl">
      <Translate content="Terms of Service" />
    </h1>
    <p className="mb-4">
      <Translate content="By using this app, you agree to the following terms:" />
    </p>
    <ul className="mb-4 pl-6 list-disc">
      <li>
        <strong>
          <Translate content="Account Responsibility:" />
        </strong>{" "}
        <Translate content="You are responsible for" />
        <Translate content="maintaining the confidentiality of your account credentials and for all activities under your account." />
      </li>
      <li>
        <strong>
          <Translate content="Data Usage:" />
        </strong>{" "}
        <Translate content="We collect only the data necessary to" />
        <Translate content="provide shopping, cart, favorites, and order history features. See our Privacy Policy for details." />
      </li>
      <li>
        <strong>
          <Translate content="Order Fulfillment:" />
        </strong>{" "}
        <Translate content="Orders placed through the app are" />
        <Translate content="subject to product availability and delivery terms. We strive to fulfill all orders promptly and accurately." />
      </li>
      <li>
        <strong>
          <Translate content="App Updates:" />
        </strong>{" "}
        <Translate content="We may update the app to improve features," />
        <Translate content="security, and performance. Continued use of the app after updates constitutes acceptance of the new terms." />
      </li>
      <li>
        <strong>
          <Translate content="Prohibited Activities:" />
        </strong>{" "}
        <Translate content="You agree not to misuse the app," />
        <Translate content="attempt unauthorized access, or engage in fraudulent activities." />
      </li>
    </ul>
    <p className="mb-4">
      <Translate content="We reserve the right to modify these terms at any time. Changes will be communicated via the app. Continued use of the app after changes means you accept the updated terms." />
    </p>
    <p>
      <Translate content="If you have questions about these terms, contact us via the app support page." />
    </p>
  </div>
);

export default TermsOfService;
