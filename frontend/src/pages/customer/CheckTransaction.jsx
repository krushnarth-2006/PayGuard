import { useState } from "react";

import TransactionForm from "../../components/transaction/TransactionForm";
import AnalyzingState from "../../components/transaction/AnalyzingState";
import TransactionResult from "../../components/transaction/TransactionResult";
import { SAMPLE_TRANSACTION_INPUT } from "../../data/sampleData";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const STORAGE_KEY = "payguard_customer_transactions";

const EMPTY_FORM = {
  amount: "",
  category: "Online Shopping",
  paymentMethod: "Credit Card",
  deviceType: "Mobile app",
  emailDomain: "",
  distanceKm: "",
  merchant: "",
  isNewRecipient: "no",
};

const STEP_COUNT = 4;

function validate(form) {
  const errors = {};

  if (!form.amount || Number(form.amount) <= 0) {
    errors.amount = "Enter a transaction amount to continue.";
  }

  if (form.distanceKm && Number(form.distanceKm) < 0) {
    errors.distanceKm = "Distance can't be negative.";
  }

  if (!form.emailDomain.trim()) {
    errors.emailDomain = "Enter an email domain.";
  }

  if (!form.merchant.trim()) {
    errors.merchant = "Enter the merchant name.";
  }

  return errors;
}

function statusFromRisk(riskLevel) {
  if (riskLevel === "HIGH") {
    return "High risk";
  }

  if (riskLevel === "MEDIUM") {
    return "Review";
  }

  return "Safe";
}

function saveTransaction(record) {
  try {
    const existing = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    const updated = [
      record,
      ...existing.filter(
        (item) =>
          item.transaction_id !== record.transaction_id
      ),
    ].slice(0, 100);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  } catch (error) {
    console.warn(
      "Unable to save transaction history:",
      error
    );
  }
}

/* -------------------------------------------------------
   Cashfree SDK
------------------------------------------------------- */

function getCashfreeInstance() {
  if (
    typeof window === "undefined" ||
    typeof window.Cashfree !== "function"
  ) {
    throw new Error(
      "Cashfree SDK is not loaded. Please refresh the page and try again."
    );
  }

  return window.Cashfree({
    mode: "sandbox",
  });
}

/* -------------------------------------------------------
   Check Cashfree payment status
------------------------------------------------------- */

async function getPaymentStatus(orderId) {
  if (!orderId) {
    throw new Error(
      "Cashfree order ID is missing."
    );
  }

  const response = await fetch(
    `${API_URL}/payment/status/${encodeURIComponent(
      orderId
    )}`
  );

  let body = {};

  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    const message =
      typeof body.detail === "string"
        ? body.detail
        : body.detail?.message ||
          "Unable to verify Cashfree payment status.";

    throw new Error(message);
  }

  return body;
}

/* -------------------------------------------------------
   Wait briefly and verify Cashfree status
------------------------------------------------------- */

async function verifyCashfreePayment(orderId) {
  /*
   * Cashfree may take a short amount of time
   * to update the payment status.
   *
   * We check immediately first, then retry.
   *
   * IMPORTANT:
   * We do NOT treat the Cashfree checkout callback
   * "error" object as the final payment result.
   *
   * The backend payment-status API is the source
   * of truth for SUCCESS / PENDING / FAILURE.
   */

  const delays = [
    0,
    1500,
    2500,
    4000,
  ];

  let latestStatus = null;

  for (const delay of delays) {
    if (delay > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }

    latestStatus =
      await getPaymentStatus(orderId);

    if (
      latestStatus?.payment_status ===
      "SUCCESS"
    ) {
      return latestStatus;
    }

    if (
      latestStatus?.payment_status ===
      "FAILURE"
    ) {
      return latestStatus;
    }

    if (
      latestStatus?.payment_status ===
      "PENDING"
    ) {
      /*
       * Do not immediately return PENDING.
       * Give Cashfree a chance to update the
       * transaction to SUCCESS or FAILURE.
       */
      continue;
    }
  }

  return latestStatus;
}

/* -------------------------------------------------------
   Component
------------------------------------------------------- */

export default function CheckTransaction() {
  const [stage, setStage] = useState("form");

  const [form, setForm] = useState(
    EMPTY_FORM
  );

  const [errors, setErrors] = useState({});

  const [stepIndex, setStepIndex] =
    useState(0);

  const [result, setResult] =
    useState(null);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }
  }

  function useSample() {
    setForm(SAMPLE_TRANSACTION_INPUT);
    setErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const nextErrors = validate(form);

    setErrors(nextErrors);

    if (
      Object.keys(nextErrors).length > 0
    ) {
      return;
    }

    setStage("loading");
    setStepIndex(0);

    const started = performance.now();

    const stepTimer = setInterval(() => {
      setStepIndex((current) =>
        Math.min(
          current + 1,
          STEP_COUNT - 1
        )
      );
    }, 650);

    try {
      /* ---------------------------------------------
         STEP 1: PayGuard fraud check
      ---------------------------------------------- */

      const fraudResponse =
        await fetch(
          `${API_URL}/payment/check`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              amount:
                Number(form.amount),

              category:
                form.category,

              paymentMethod:
                form.paymentMethod,

              deviceType:
                form.deviceType,

              emailDomain:
                form.emailDomain.trim(),

              distanceKm:
                Number(
                  form.distanceKm || 0
                ),

              merchant:
                form.merchant.trim(),

              isNewRecipient:
                form.isNewRecipient,
            }),
          }
        );

      let fraudBody = {};

      try {
        fraudBody =
          await fraudResponse.json();
      } catch {
        fraudBody = {};
      }

      if (!fraudResponse.ok) {
        const message =
          typeof fraudBody.detail ===
          "string"
            ? fraudBody.detail
            : fraudBody.detail?.message ||
              "Payment fraud check failed.";

        throw new Error(message);
      }

      const fraudLatency =
        Math.round(
          performance.now() -
            started
        );

      const record = {
        ...form,

        id:
          fraudBody.transaction_id,

        transaction_id:
          fraudBody.transaction_id,

        date:
          new Date().toISOString(),

        probability:
          Number(
            fraudBody.fraud_probability
          ),

        fraud_probability:
          Number(
            fraudBody.fraud_probability
          ),

        prediction:
          fraudBody.prediction,

        decision:
          fraudBody.decision,

        riskLevel:
          fraudBody.risk_level,

        risk_level:
          fraudBody.risk_level,

        status:
          statusFromRisk(
            fraudBody.risk_level
          ),

        response_time_ms:
          fraudLatency,

        latencyMs:
          fraudLatency,

        cashfree_order_id:
          null,

        cf_order_id:
          null,

        payment_session_id:
          null,

        payment_status:
          null,

        cashfree_payments: [],
      };

      /* ---------------------------------------------
         BLOCKED BY PAYGUARD
      ---------------------------------------------- */

      if (
        fraudBody.decision ===
        "BLOCK"
      ) {
        clearInterval(stepTimer);

        record.payment_status =
          "BLOCKED_BY_PAYGUARD";

        record.payment_status_message =
          "Payment blocked by PayGuard because the transaction was classified as high risk.";

        saveTransaction(record);

        setResult(record);
        setStage("result");

        return;
      }

      /* ---------------------------------------------
         Only ALLOW can continue
      ---------------------------------------------- */

      if (
        fraudBody.decision !==
        "ALLOW"
      ) {
        throw new Error(
          "PayGuard returned an invalid payment decision."
        );
      }

      /* ---------------------------------------------
         STEP 2: Create Cashfree order
      ---------------------------------------------- */

      setStepIndex(2);

      const orderResponse =
        await fetch(
          `${API_URL}/payment/create-order`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              amount:
                Number(form.amount),

              category:
                form.category,

              paymentMethod:
                form.paymentMethod,

              deviceType:
                form.deviceType,

              emailDomain:
                form.emailDomain.trim(),

              distanceKm:
                Number(
                  form.distanceKm || 0
                ),

              merchant:
                form.merchant.trim(),

              isNewRecipient:
                form.isNewRecipient,
            }),
          }
        );

      let orderBody = {};

      try {
        orderBody =
          await orderResponse.json();
      } catch {
        orderBody = {};
      }

      if (!orderResponse.ok) {
        const message =
          typeof orderBody.detail ===
          "string"
            ? orderBody.detail
            : orderBody.detail?.message ||
              "Unable to create Cashfree order.";

        throw new Error(message);
      }

      if (
        !orderBody.payment_session_id
      ) {
        throw new Error(
          "Cashfree did not return a payment session ID."
        );
      }

      if (!orderBody.order_id) {
        throw new Error(
          "Cashfree did not return an order ID."
        );
      }

      record.cashfree_order_id =
        orderBody.order_id || null;

      record.cf_order_id =
        orderBody.cf_order_id || null;

      record.payment_session_id =
        orderBody.payment_session_id;

      record.payment_status =
        "CHECKOUT_READY";

      saveTransaction(record);

      /* ---------------------------------------------
         STEP 3: Open Cashfree Sandbox Checkout
      ---------------------------------------------- */

      setStepIndex(3);

      const cashfree =
        getCashfreeInstance();

      let checkoutResult = null;

      try {
        checkoutResult =
          await cashfree.checkout({
            paymentSessionId:
              orderBody.payment_session_id,

            redirectTarget:
              "_modal",
          });
      } catch (checkoutError) {
        /*
         * IMPORTANT:
         *
         * A JavaScript exception from the SDK means
         * the checkout call itself failed to execute.
         *
         * However, we still attempt to verify the
         * server-side Cashfree order status because
         * the payment may have already been attempted.
         */

        console.error(
          "Cashfree checkout exception:",
          checkoutError
        );

        record.payment_status =
          "VERIFYING";

        record.payment_status_message =
          checkoutError?.message ||
          "Cashfree checkout returned an exception. Verifying payment status...";

        saveTransaction(record);
      }

      /*
       * IMPORTANT FIX:
       *
       * Cashfree can return an object containing
       * "error". That does NOT automatically mean
       * the payment failed.
       *
       * We log the callback information and continue
       * to the backend payment-status verification.
       */

      if (checkoutResult?.error) {
        console.warn(
          "Cashfree checkout callback returned an error. Checking actual payment status...",
          checkoutResult.error
        );
      }

      if (checkoutResult?.paymentDetails) {
        console.log(
          "Cashfree payment details received:",
          checkoutResult.paymentDetails
        );
      }

      if (checkoutResult?.redirect) {
        console.log(
          "Cashfree requested redirect."
        );
      }

      /* ---------------------------------------------
         STEP 4: Verify actual payment status
      ---------------------------------------------- */

      record.payment_status =
        "VERIFYING";

      saveTransaction(record);

      let paymentStatus;

      try {
        paymentStatus =
          await verifyCashfreePayment(
            orderBody.order_id
          );
      } catch (statusError) {
        console.error(
          "Payment status verification failed:",
          statusError
        );

        record.payment_status =
          "STATUS_CHECK_FAILED";

        record.payment_status_message =
          statusError?.message ||
          "Unable to verify payment status.";

        const totalLatency =
          Math.round(
            performance.now() -
              started
          );

        record.response_time_ms =
          totalLatency;

        record.latencyMs =
          totalLatency;

        saveTransaction(record);

        clearInterval(stepTimer);

        setResult(record);
        setStage("result");

        return;
      }

      /* ---------------------------------------------
         Store Cashfree payment status
      ---------------------------------------------- */

      record.payment_status =
        paymentStatus?.payment_status ||
        "UNKNOWN";

      record.cashfree_payments =
        paymentStatus?.payments || [];

      if (
        record.payment_status ===
        "SUCCESS"
      ) {
        record.payment_status_message =
          "Payment completed successfully.";
      } else if (
        record.payment_status ===
        "PENDING"
      ) {
        record.payment_status_message =
          "Payment is still pending. Please check again later.";
      } else if (
        record.payment_status ===
        "FAILURE"
      ) {
        record.payment_status_message =
          "Payment was not completed.";
      } else {
        record.payment_status_message =
          "Payment status could not be determined.";
      }

      /* ---------------------------------------------
         Final response latency
      ---------------------------------------------- */

      const totalLatency =
        Math.round(
          performance.now() -
            started
        );

      record.response_time_ms =
        totalLatency;

      record.latencyMs =
        totalLatency;

      saveTransaction(record);

      clearInterval(stepTimer);

      setResult(record);
      setStage("result");
    } catch (error) {
      clearInterval(stepTimer);

      console.error(
        "PayGuard payment flow failed:",
        error
      );

      setErrors({
        amount:
          error.message ||
          "Unable to process the payment. Please try again.",
      });

      setStage("form");
    }
  }

  function reset() {
    setForm(EMPTY_FORM);
    setErrors({});
    setResult(null);
    setStage("form");
    setStepIndex(0);
  }

  if (stage === "loading") {
    return (
      <AnalyzingState
        stepIndex={stepIndex}
      />
    );
  }

  if (
    stage === "result" &&
    result
  ) {
    return (
      <TransactionResult
        result={result}
        onReset={reset}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-ink-900 dark:text-ink-50">
          Check a Payment
        </h2>

        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
          Verify your payment before you complete it.
        </p>
      </div>

      <TransactionForm
        form={form}
        errors={errors}
        onChange={update}
        onSubmit={handleSubmit}
        onUseSample={useSample}
      />
    </div>
  );
}