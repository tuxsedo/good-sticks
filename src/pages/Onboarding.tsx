import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import OnboardingStep from "@/components/OnboardingStep";
import FavoriteCigarsStep from "@/components/FavoriteCigarsStep";
import { Cigarette, ArrowRight, SkipForward } from "lucide-react";
import type { PalateProfile, FlavorNote } from "@/lib/types";

const FLAVOR_OPTIONS = [
  { value: "cedar", label: "Cedar" },
  { value: "leather", label: "Leather" },
  { value: "coffee", label: "Coffee" },
  { value: "dark_chocolate", label: "Dark Chocolate" },
  { value: "nuts", label: "Nuts / Almonds" },
  { value: "spice", label: "Spice" },
  { value: "earth", label: "Earth / Must" },
  { value: "cream", label: "Cream / Butter" },
  { value: "pepper", label: "Black Pepper" },
  { value: "fruit", label: "Dried Fruit" },
  { value: "floral", label: "Floral / Honey" },
  { value: "sweet", label: "Natural Sweetness" },
];

const TOTAL_STEPS = 6;

const steps = [
  {
    headline: "How long have you been smoking cigars?",
    options: [
      { value: "beginner", label: "Just getting started", subtext: "Under a year" },
      { value: "getting_serious", label: "Getting serious", subtext: "1–3 years" },
      { value: "experienced", label: "Experienced", subtext: "3–7 years" },
      { value: "veteran", label: "Full-on aficionado", subtext: "7+ years" },
    ],
  },
  {
    headline: "What strength do you usually reach for?",
    subtext: "When you're in the mood for your go-to smoke, what's the body like?",
    options: [
      { value: "mild", label: "Mild", subtext: "Connecticut wrappers, easy and smooth" },
      { value: "mild_medium", label: "Mild-Medium", subtext: "Some depth, nothing overwhelming" },
      { value: "medium", label: "Medium", subtext: "Your sweet spot — balanced and complex" },
      { value: "medium_full", label: "Medium-Full", subtext: "You like to feel it" },
      { value: "full", label: "Full", subtext: "The fuller the better" },
    ],
  },
  {
    headline: "Which flavor notes do you love?",
    subtext: "Select everything that resonates when a smoke is really working.",
    multiSelect: true,
    options: FLAVOR_OPTIONS,
  },
  {
    headline: "Anything you want to avoid?",
    subtext: "This helps GoodSticks steer clear. Skip if nothing comes to mind.",
    multiSelect: true,
    skippable: true,
    options: FLAVOR_OPTIONS,
  },
  {
    headline: "What do you usually drink with a cigar?",
    subtext: "Your go-to — even if it changes.",
    options: [
      { value: "bourbon_whiskey", label: "Bourbon / Whiskey" },
      { value: "scotch", label: "Scotch" },
      { value: "rum", label: "Rum" },
      { value: "beer", label: "Beer / Craft Beer" },
      { value: "wine", label: "Wine" },
      { value: "coffee", label: "Coffee / Espresso" },
      { value: "non_alcoholic", label: "Water / Non-alcoholic" },
      { value: "varies", label: "Depends on the mood" },
    ],
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const [answers, setAnswers] = useState({
    experience: "" as string,
    strength: "" as string,
    loveFlavors: [] as string[],
    dislikeFlavors: [] as string[],
    drinkPairing: "" as string,
    favoriteCigars: [] as string[],
  });

  const isCigarStep = currentStep === 5;
  const step = steps[currentStep];

  const getCurrentValue = () => {
    if (isCigarStep) return answers.favoriteCigars;
    const keys = ["experience", "strength", "loveFlavors", "dislikeFlavors", "drinkPairing"] as const;
    return answers[keys[currentStep]];
  };

  const handleSelect = (value: string) => {
    if (isCigarStep) return;
    const keys = ["experience", "strength", "loveFlavors", "dislikeFlavors", "drinkPairing"] as const;
    const key = keys[currentStep];
    const isMultiSelect = step?.multiSelect;

    if (isMultiSelect) {
      const current = answers[key] as string[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [key]: updated });
    } else {
      setAnswers({ ...answers, [key]: value });
    }
  };

  const canAdvance = () => {
    if (isCigarStep) return answers.favoriteCigars.length > 0;
    const val = getCurrentValue();
    if (step?.skippable) return true;
    if (Array.isArray(val)) return val.length > 0;
    return val !== "";
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const profile: PalateProfile = {
        experience: answers.experience as PalateProfile["experience"],
        strength: answers.strength as PalateProfile["strength"],
        loveFlavors: answers.loveFlavors as FlavorNote[],
        dislikeFlavors: answers.dislikeFlavors as FlavorNote[],
        drinkPairing: answers.drinkPairing as PalateProfile["drinkPairing"],
        favoriteCigars: answers.favoriteCigars,
      };
      localStorage.setItem("gs_palate", JSON.stringify(profile));
      localStorage.setItem("gs_conversations", "0");
      setShowCompletion(true);
    }
  };

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-ember-gradient flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-fade-in max-w-md">
          <Cigarette className="h-12 w-12 text-primary mx-auto mb-6 animate-ember-pulse" />
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Your palate profile is set.
          </h1>
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
            GoodSticks is ready. Let's talk cigars — ask about recommendations, 
            pairings, brands, or anything on your mind.
          </p>
          <Button
            variant="ember"
            size="lg"
            className="text-base px-8 py-6"
            onClick={() => navigate("/chat")}
          >
            Let's talk cigars
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ember-gradient flex flex-col">
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Cigarette className="h-5 w-5 text-primary" />
          <span className="font-display text-lg font-semibold text-foreground">GoodSticks</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {currentStep + 1} of {TOTAL_STEPS}
        </span>
      </div>

      <div className="px-6">
        <div className="h-1 rounded-full bg-secondary">
          <div
            className="h-1 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {currentStep === 0 && (
        <p className="text-muted-foreground text-sm px-6 mt-6 italic">
          Let's learn your palate. Takes about 90 seconds.
        </p>
      )}

      <main className="flex-1 flex flex-col px-6 pt-8 pb-6 max-w-lg mx-auto w-full" key={currentStep}>
        {isCigarStep ? (
          <FavoriteCigarsStep
            cigars={answers.favoriteCigars}
            onChange={(cigars) => setAnswers({ ...answers, favoriteCigars: cigars })}
          />
        ) : (
          <OnboardingStep
            headline={step.headline}
            subtext={step.subtext}
            options={step.options}
            selected={getCurrentValue()}
            multiSelect={step.multiSelect}
            onSelect={handleSelect}
          />
        )}

        <div className="mt-auto pt-8 flex gap-3">
          {!isCigarStep && step?.skippable && (
            <Button
              variant="ember-ghost"
              size="lg"
              className="flex-1"
              onClick={handleNext}
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip
            </Button>
          )}
          <Button
            variant="ember"
            size="lg"
            className="flex-1 py-6"
            disabled={!canAdvance()}
            onClick={handleNext}
          >
            {currentStep === TOTAL_STEPS - 1 ? "Finish" : "Continue"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
