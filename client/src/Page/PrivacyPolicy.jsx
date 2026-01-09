import React from "react";
import { useSelector } from "react-redux";

const PrivacyPolicy = () => {
  const { address, email, phoneNumber } = useSelector(
    (state) => state?.ShopInfo
  );
  return (
    <div className="privacy-policy px-6 py-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        Welcome to our Privacy Policy page. At <strong>KGS DOORS</strong>, we
        are committed to protecting your personal information and ensuring your
        experience with us is safe and secure. This Privacy Policy explains how
        we collect, use, and protect the data you provide to us.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">
        1. Information We Collect
      </h2>
      <ul className="list-disc pl-6 mb-4">
        <li>
          <strong>Personal Information:</strong> When you register, place an
          order, or contact us, we may collect personal details such as your
          name, email address, phone number, and shipping address.
        </li>
        <li>
          <strong>Payment Information:</strong> We do not store your payment
          details. Payments processed through secure third-party providers are
          encrypted.
        </li>
        <li>
          <strong>Browsing Information:</strong> We may collect data on how you
          interact with our website, such as pages visited, search queries, and
          device type, using cookies or similar technologies.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-4">
        2. How We Use Your Information
      </h2>
      <p className="mb-4">We use your data for the following purposes:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>To process and deliver your orders efficiently.</li>
        <li>To improve our website and enhance user experience.</li>
        <li>
          To send updates, promotions, or important notifications about your
          orders.
        </li>
        <li>To respond to your customer service requests and support needs.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-4">
        3. Sharing of Information
      </h2>
      <p className="mb-4">
        We do not sell, trade, or rent your personal information to third
        parties. However, we may share your information with:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>
          Trusted service providers assisting in website hosting, shipping, and
          payment processing.
        </li>
        <li>
          Legal authorities, if required by law or to protect our rights and
          property.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-4">
        4. Security of Your Data
      </h2>
      <p className="mb-4">
        We implement industry-standard security measures to protect your data
        from unauthorized access, alteration, or disclosure. However, no method
        of data transmission over the internet is 100% secure, and we cannot
        guarantee absolute security.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">5. Your Rights</h2>
      <p className="mb-4">You have the right to:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Access, update, or delete your personal information.</li>
        <li>
          Opt-out of receiving promotional emails by clicking "Unsubscribe" in
          our emails.
        </li>
        <li>Request a copy of the data we hold about you.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-4">6. Cookies</h2>
      <p className="mb-4">
        We use cookies to enhance your browsing experience. Cookies are small
        files stored on your device that allow us to identify repeat visitors
        and analyze site traffic. You can control cookies through your browser
        settings.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">
        7. Updates to This Policy
      </h2>
      <p className="mb-4">
        We may update this Privacy Policy periodically to reflect changes in our
        practices or for legal reasons. Please review this page regularly for
        the latest information.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">8. Contact Us</h2>
      <p className="mb-4">
        If you have any questions or concerns about our Privacy Policy, please
        contact us at:
      </p>
      <p className="mb-2">
        <strong>Email:</strong> {email || "support@kgsdoors.com"}
      </p>
      <p className="mb-2">
        <strong>Phone:</strong>+91- {phoneNumber || 990352887}
      </p>
      <p className="mb-4">
        <strong>Address:</strong>{" "}
        {address || " word NO. 21 Hanumangarh road, Sangria,Hanumangarh,In"}
      </p>

      <p className="text-sm text-gray-600">Last updated: January 11, 2025</p>
    </div>
  );
};

export default PrivacyPolicy;
