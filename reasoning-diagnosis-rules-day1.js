/* Day 1 domain registrations for the universal reasoning engine.
   Content-specific signatures live here, not in the orchestrator. */

var proportion2x = {
  skillId: "proportion_variable_denominator",
  signatures: [
    {
      id: "divide_right_fraction_by_two",
      responses: ["6/15/2", "(6/15)/2"],
      reasoningStep: "interpret_variable_denominator_or_proportion_operation",
      errorCode: "PROP_DIVIDE_SIDE_BY_NUMERATOR",
      unambiguous: false,
      probe: {
        id: "meaning_of_2_over_x",
        type: "multiple_choice",
        prompt: "Before we move anything, what does 2/x mean?",
        choices: ["2 × x", "2 ÷ x", "x ÷ 2", "I'm not sure"]
      }
    }
  ],
  fallbackProbe: {
    id: "first_proportion_move",
    type: "work_trace",
    prompt: "Show me the first thing you would do to 2/x = 6/15."
  },
  resolveProbe: function(response) {
    var r = String(response || "").toLowerCase();
    if (r === "2 ÷ x" || r === "b") {
      return { reasoningStep: "cross_products_preserve_proportion", errorCode: "PROP_CROSS_PRODUCT_GAP" };
    }
    if (r === "2 × x" || r === "a") {
      return { reasoningStep: "interpret_variable_denominator", errorCode: "PROP_DENOMINATOR_MEANING" };
    }
    if (r === "x ÷ 2" || r === "c") {
      return { reasoningStep: "fraction_orientation", errorCode: "PROP_FRACTION_ORIENTATION" };
    }
    if (r.indexOf("not sure") >= 0 || r === "d") {
      return { reasoningStep: "interpret_variable_denominator", errorCode: "PROP_DENOMINATOR_MEANING" };
    }
    return null;
  }
};

var logScientific = {
  skillId: "negative_log_scientific_notation",
  signatures: [],
  fallbackProbe: {
    id: "log_breakdown_location",
    type: "multiple_choice",
    prompt: "Which part stops making sense?",
    choices: [
      "Why log(10^-6) = -6",
      "What the negative sign outside log does",
      "How to estimate log(6)",
      "How the pieces combine",
      "I'm not sure"
    ]
  },
  resolveProbe: function(response) {
    var r = String(response || "").toLowerCase();
    if (r.indexOf("10^-6") >= 0 || r.indexOf("10⁻⁶") >= 0) return { reasoningStep: "log_power_of_ten", errorCode: "LOG_POWER_TEN_GAP" };
    if (r.indexOf("outside") >= 0 || r.indexOf("negative sign") >= 0) return { reasoningStep: "outer_negative_distribution", errorCode: "LOG_OUTER_NEGATIVE_GAP" };
    if (r.indexOf("estimate") >= 0 || r.indexOf("log(6)") >= 0) return { reasoningStep: "estimate_log_coefficient", errorCode: "LOG_ESTIMATION_GAP" };
    if (r.indexOf("combine") >= 0) return { reasoningStep: "combine_log_parts", errorCode: "LOG_COMBINATION_GAP" };
    return null;
  }
};

var repairs = {
  interpret_variable_denominator: {
    representations: ["fraction_reading_diagram", "concrete_analogy", "worked_example"],
    explanation: "In 2/x, the fraction bar means division: 2 is divided by x. x is the denominator, so this is not 2 times x and not x divided by 2.",
    microCheck: { prompt: "What does 3/y mean?", answer: "3 ÷ y" }
  },
  fraction_orientation: {
    representations: ["fraction_reading_diagram", "worked_example"],
    explanation: "The top number is divided by the bottom number. 2/x means 2 divided by x; reversing it to x/2 changes the value.",
    microCheck: { prompt: "Which means a divided by b: a/b or b/a?", answer: "a/b" }
  },
  cross_products_preserve_proportion: {
    representations: ["diagonal_product_animation", "balance_equation", "worked_example", "build_together"],
    explanation: "Cross multiplication is a shortcut that comes from multiplying both sides by both denominators. For 2/x = 6/15, multiply both sides by 15x. The denominators cancel, leaving 2×15 = 6×x. That is why the diagonal products are equal; it is not a rule we memorize without a reason.",
    microCheck: { prompt: "For 3/y = 9/12, which equation has the equal cross-products?", answer: "3×12 = 9y" }
  },
  log_power_of_ten: {
    representations: ["power_flip_animation", "number_line", "worked_example"],
    explanation: "A base-10 logarithm asks: 10 raised to what power gives this number? Since 10^-6 is already written as a power of 10, log(10^-6) = -6.",
    microCheck: { prompt: "What is log(10^-4)?", answer: "-4" }
  },
  outer_negative_distribution: {
    representations: ["sign_box_animation", "worked_example", "concrete_analogy"],
    explanation: "Keep the outside negative until the inside is clear. If the inside becomes -5.22, then the outside negative gives -(-5.22) = +5.22. A negative of a negative is positive.",
    microCheck: { prompt: "What is -(-3.4)?", answer: "3.4" }
  },
  estimate_log_coefficient: {
    representations: ["power_landmarks", "number_line", "worked_example"],
    explanation: "Because 6 is between 1 and 10, log(6) must be between 0 and 1. Using the no-calculator landmark, log(6) is about 0.78.",
    microCheck: { prompt: "Without calculating exactly, is log(4) between 0 and 1 or between 1 and 2?", answer: "between 0 and 1" }
  },
  combine_log_parts: {
    representations: ["split_expression_animation", "worked_example", "build_together"],
    explanation: "Split the product first: -[log(6) + log(10^-6)]. The power-of-ten part is -6, so this becomes -[log(6) - 6]. With log(6)≈0.78, the inside is -5.22, and the outside negative makes the result +5.22.",
    microCheck: { prompt: "In -[0.7 - 5], is the final result positive or negative?", answer: "positive" }
  }
};

module.exports = { proportion2x: proportion2x, logScientific: logScientific, repairs: repairs };
