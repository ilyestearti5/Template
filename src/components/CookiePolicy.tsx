import React from "react";
import { Translate } from "@biqpod/app/ui/components";

export const CookiePolicy: React.FC = () => (
  <div className="mx-auto px-4 py-10 max-w-2xl">
    <h1 className="mb-6 font-bold text-3xl">
      <Translate content="Cookie Policy" />
    </h1>
    <p className="mb-4">
      <Translate content="This website uses cookies to ensure you get the best experience on our website. A cookie is a small piece of data stored on your computer or mobile device by your web browser." />
    </p>
    <ul className="mb-4 pl-6 list-disc">
      <li>
        <strong>
          <Translate content="Essential Cookies:" />
        </strong>{" "}
        <Translate content="These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms." />
      </li>
      <li>
        <strong>
          <Translate content="Performance Cookies:" />
        </strong>{" "}
        <Translate content="These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site." />
      </li>
      <li>
        <strong>
          <Translate content="Functionality Cookies:" />
        </strong>{" "}
        <Translate content="These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by third party providers whose services we have added to our pages." />
      </li>
      <li>
        <strong>
          <Translate content="Targeting Cookies:" />
        </strong>{" "}
        <Translate content="These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites." />
      </li>
    </ul>
    <p className="mb-4">
      <Translate content="You can set your browser to block or alert you about these cookies, but some parts of the site will not then work. For more information about cookies, and how to disable them, please see our full cookie policy." />
    </p>
    <p>
      <Translate content="If you have questions about our cookie policy, contact us via the app support page." />
    </p>
  </div>
);
