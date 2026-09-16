import { useState } from "react";
import TransactionForm from "../../components/transaction/TransactionForm";
import AnalyzingState from "../../components/transaction/AnalyzingState";
import TransactionResult from "../../components/transaction/TransactionResult";
import { SAMPLE_TRANSACTION_INPUT } from "../../data/sampleData";
import { analyzeTransaction } from "../../data/mockApi";

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

  return errors;
}

export default function CheckTransaction() {
  const [stage, setStage] = useState("form");
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);

  function update(field, value) {
    setForm((f) => ({
      ...f,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((e) => ({
        ...e,
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

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setStage("loading");
    setStepIndex(0);

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEP_COUNT - 1));
    }, 650);

    try {
      const response = await analyzeTransaction(form);

      clearInterval(stepTimer);

      if (!response.success) {
        throw new Error(
          response.error || "Unable to analyze transaction."
        );
      }

      setResult(response.data);
      setStage("result");
    } catch (error) {
      clearInterval(stepTimer);

      console.error("Transaction analysis failed:", error);

      setErrors({
        amount:
          error.message ||
          "Something went wrong while analyzing this payment. Please try again.",
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
    return <AnalyzingState stepIndex={stepIndex} />;
  }

  if (stage === "result" && result) {
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