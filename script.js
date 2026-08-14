const CATEGORIES = [
  {
    id: "web-shop",
    label: "Web Shop",
    features: [
      {
        id: "shop-builder",
        label: "Shop Builder",
        title: "Shop Builder",
        description:
          "Launch a Web Shop that looks and feels like your game, with ready-made templates and customization that doesn’t require code.",
      },
      {
        id: "catalog",
        label: "Catalog",
        title: "Catalog",
        description:
          "Import, sync, and manage your game's IAPs on the web, so your storefront stays consistent, accurate, and easy to maintain over time.",
      },
      {
        id: "login",
        label: "Login",
        title: "Login",
        description:
          "Quickly enable localized, one-click authentication for your players, keeping their data secure, compliant, and fully under your control",
      },
      {
        id: "payments",
        label: "Payments (Pay Station)",
        title: "Payments",
        description:
          "Accept over 1,000 local payment methods across more than 200 countries, with Merchant of Record, tax, fraud, and compliance all handled for you.",
      },
      {
        id: "mobile-account",
        label: "Mobile Account",
        title: "Mobile Account",
        description:
          "One interface to manage the full ecosystem. Engage, Monetize, and Operate all sit in one place – set up in hours.",
      },
    ],
  },
  {
    id: "engage",
    label: "Engage",
    features: [
      {
        id: "loyalty-program",
        label: "Loyalty Program",
        title: "Loyalty Program",
        description:
          "Turn one-time buyers into repeat customers with points, rewards, and exclusive perks that build the habit of buying on your Web Shop.",
      },
      {
        id: "referral-program",
        label: "Referral Program",
        title: "Referral Program",
        description:
          "Turn your best buyers into advocates who bring new players to your shop without the paid acquisition costs",
      },
      {
        id: "social-quests",
        label: "Social Quests",
        title: "Social Quests",
        description:
          "Turn Web Shop visitors into community members by rewarding them for following, sharing, and engaging with your social channels",
      },
    ],
  },
  {
    id: "monetize",
    label: "Monetize",
    features: [
      {
        id: "discord-bot",
        label: "Discord Bot",
        title: "Discord Bot",
        description:
          "Bring your Web Shop into Discord, where your community already spends time. Rewards, catalog access, and purchases all happen without players leaving the server.",
      },
      {
        id: "buy-button",
        label: "Buy Button",
        title: "Buy Button",
        description:
          "A one-tap link-out from your iOS or Android mobile game to your Web Shop checkout, taking players from in-game to purchase in one tap.",
      },
      {
        id: "offerwall",
        label: "Offerwall",
        title: "Offerwall",
        description:
          "Monetize non-paying players through advertiser-funded rewards, adding incremental revenue from the players who don't buy directly.",
      },
      {
        id: "subscriptions",
        label: "Subscriptions",
        title: "Subscriptions",
        description:
          "Add recurring revenue to your D2C business with battle passes, tiered access, and bundles that keep players committed to your game over the long term.",
      },
      {
        id: "sdk",
        label: "SDK",
        title: "SDK",
        description:
          "One integration across mobile, PC, and web, with payments, login, catalog, and offerwall all deployed from a single cross-platform SDK.",
      },
    ],
  },
  {
    id: "operate",
    label: "Operate",
    features: [
      {
        id: "xsolla-liveops",
        label: "Xsolla LiveOps",
        title: "LiveOps",
        description:
          "Design, run, and optimize D2C campaigns from one visual Canvas workspace, with offer chains, daily rewards, and personalization, all with no code required.",
      },
      {
        id: "analytics",
        label: "Analytics",
        title: "Analytics",
        description:
          "Surface the metrics that matter, with revenue, player behavior, and shop performance in one dashboard so you always know what's working.",
      },
      {
        id: "mmp",
        label: "MMP",
        title: "MMP",
        description:
          "Close the attribution loop between web and in-game – AppsFlyer, Adjust, and Singular integrations that show the full picture of every UA dollar spent.",
      },
    ],
  },
];

const categoriesById = new Map(
  CATEGORIES.map((category) => [category.id, category]),
);
const featuresById = new Map();

for (const category of CATEGORIES) {
  for (const feature of category.features) {
    featuresById.set(feature.id, { ...feature, category });
  }
}

const activeFeatureByCategory = new Map(
  CATEGORIES.map((category) => [category.id, category.features[0].id]),
);

const categoryButtons = [...document.querySelectorAll("button[data-category]")];
const featureTabs = document.querySelector("#feature-tabs");
const panel = document.querySelector("#feature-panel");
const title = document.querySelector("#feature-title");
const description = document.querySelector("#feature-description");
const riveSlot = document.querySelector("#rive-slot");
const riveCanvas = document.querySelector("#ecosystem-rive");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let activeCategoryId = "web-shop";
let activeFeatureId = "shop-builder";
const DEFAULT_INITIAL_FEATURE_ID = "shop-builder";

function renderCategoryButtons() {
  for (const button of categoryButtons) {
    const isActive = button.dataset.category === activeCategoryId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  }
}

function renderFeatureTabs() {
  const category = categoriesById.get(activeCategoryId);
  featureTabs.setAttribute("aria-label", `${category.label} features`);
  featureTabs.innerHTML = category.features
    .map((feature) => {
      const isActive = feature.id === activeFeatureId;
      return `
        <button
          id="tab-${feature.id}"
          class="feature-tab${isActive ? " is-active" : ""}"
          type="button"
          role="tab"
          aria-selected="${isActive}"
          aria-controls="feature-panel"
          tabindex="${isActive ? 0 : -1}"
          data-feature="${feature.id}"
        >${feature.label}</button>`;
    })
    .join("");
}

function updateHash(featureId, replace = false) {
  if (window.location.hash === `#${featureId}`) return;

  const method = replace ? "replaceState" : "pushState";
  history[method]({ feature: featureId }, "", `#${featureId}`);
}

function activateFeature(featureId, options = {}) {
  const {
    updateUrl = true,
    replaceHash = false,
    bringIntoView = false,
    animate = true,
  } = options;
  const feature = featuresById.get(featureId);

  if (!feature) return;

  const categoryChanged = activeCategoryId !== feature.category.id;
  activeCategoryId = feature.category.id;
  activeFeatureId = feature.id;
  activeFeatureByCategory.set(activeCategoryId, activeFeatureId);

  renderCategoryButtons();
  if (categoryChanged || !featureTabs.querySelector(`[data-feature="${featureId}"]`)) {
    renderFeatureTabs();
  }

  const tabs = [...featureTabs.querySelectorAll(".feature-tab")];
  const activeTab = tabs.find((tab) => tab.dataset.feature === featureId);

  for (const tab of tabs) {
    const isActive = tab === activeTab;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  }

  title.textContent = feature.title;
  description.textContent = feature.description;
  panel.setAttribute("aria-labelledby", activeTab.id);
  riveSlot.dataset.category = activeCategoryId;
  riveSlot.dataset.feature = activeFeatureId;
  riveSlot.setAttribute(
    "aria-label",
    `Rive content panel for ${feature.title}`,
  );
  riveCanvas.dataset.riveCategory = activeCategoryId;
  riveCanvas.dataset.riveState = activeFeatureId;

  if (animate && !reducedMotion.matches) {
    panel.animate(
      [
        { opacity: 0.72, transform: "translateY(5px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 180, easing: "cubic-bezier(.2,.7,.2,1)" },
    );
  }

  if (bringIntoView) {
    const scroller = activeTab.closest("[data-tab-scroller]");
    const targetLeft =
      activeTab.offsetLeft - (scroller.clientWidth - activeTab.offsetWidth) / 2;

    scroller.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: !animate || reducedMotion.matches ? "auto" : "smooth",
    });
  }

  if (updateUrl) updateHash(activeFeatureId, replaceHash);

  document.dispatchEvent(
    new CustomEvent("ecosystem:featurechange", {
      detail: {
        category: activeCategoryId,
        feature: activeFeatureId,
        riveState: activeFeatureId,
        canvas: riveCanvas,
      },
    }),
  );
}

for (const button of categoryButtons) {
  button.addEventListener("click", () => {
    activateFeature(activeFeatureByCategory.get(button.dataset.category), {
      bringIntoView: true,
    });
  });

  button.addEventListener("keydown", (event) => {
    const currentIndex = categoryButtons.indexOf(button);
    let nextIndex = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % categoryButtons.length;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex =
        (currentIndex - 1 + categoryButtons.length) % categoryButtons.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = categoryButtons.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextButton = categoryButtons[nextIndex];
    activateFeature(activeFeatureByCategory.get(nextButton.dataset.category), {
      bringIntoView: true,
    });
    nextButton.focus();
  });
}

featureTabs.addEventListener("click", (event) => {
  const tab = event.target.closest(".feature-tab");
  if (!tab) return;
  activateFeature(tab.dataset.feature, { bringIntoView: true });
});

featureTabs.addEventListener("keydown", (event) => {
  const tab = event.target.closest(".feature-tab");
  if (!tab) return;

  const tabs = [...featureTabs.querySelectorAll(".feature-tab")];
  const currentIndex = tabs.indexOf(tab);
  let nextIndex = null;

  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
  if (event.key === "ArrowLeft") {
    nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  }
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = tabs.length - 1;
  if (nextIndex === null) return;

  event.preventDefault();
  const nextTab = tabs[nextIndex];
  activateFeature(nextTab.dataset.feature, { bringIntoView: true });
  nextTab.focus();
});

window.addEventListener("hashchange", () => {
  const featureId = window.location.hash.slice(1);
  activateFeature(
    featuresById.has(featureId) ? featureId : DEFAULT_INITIAL_FEATURE_ID,
    {
      updateUrl: false,
      bringIntoView: true,
    },
  );
});

activateFeature(DEFAULT_INITIAL_FEATURE_ID, {
  replaceHash: true,
  bringIntoView: true,
  animate: false,
});

/*
  Future Rive integration:

  document.addEventListener("ecosystem:featurechange", (event) => {
    const { category, riveState, canvas } = event.detail;
    // Update the bound Rive enum/string or fire a state-machine input here.
  });
*/
