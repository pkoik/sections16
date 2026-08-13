(() => {
  "use strict";

  const CONFIG = Object.freeze({
    file: "./assets/webshopecosystem_01_v04.riv",
    renderer: "canvas",
    stateMachine: "State Machine 1",
    enumName: "Enum01",
    wasm: "./vendor/rive-2.39.1.wasm",
    wasmFallback: "./vendor/rive_fallback-2.39.1.wasm",
    wasmFileFallback:
      "https://cdn.jsdelivr.net/npm/@rive-app/canvas@2.39.1/rive.wasm",
  });

  const CATEGORY_BINDINGS = Object.freeze({
    "web-shop": Object.freeze({
      artboard: "01MAIN",
      viewModel: "VM01",
      viewModelInstance: "Instance 2",
      enumProperty: "enumSelect",
      features: Object.freeze([
        "shop-builder",
        "catalog",
        "login",
        "payments",
        "mobile-account",
      ]),
    }),
    engage: Object.freeze({
      artboard: "02MAIN",
      viewModel: "VM02",
      viewModelInstance: "Instance",
      enumProperty: "enumSelect2",
      features: Object.freeze([
        "loyalty-program",
        "referral-program",
        "social-quests",
      ]),
    }),
    monetize: Object.freeze({
      artboard: "03MAIN",
      viewModel: "VM03",
      viewModelInstance: "Instance",
      enumProperty: "enumSelect3",
      features: Object.freeze([
        "discord-bot",
        "buy-button",
        "offerwall",
        "subscriptions",
        "sdk",
      ]),
    }),
    operate: Object.freeze({
      artboard: "04MAIN",
      viewModel: "VM04",
      viewModelInstance: "Instance 2",
      enumProperty: "enumSelect4",
      features: Object.freeze([
        "xsolla-liveops",
        "analytics",
        "mmp",
      ]),
    }),
  });

  const FEATURE_BINDINGS = Object.freeze({
    "shop-builder": Object.freeze({
      category: "web-shop",
      enumValue: "01",
      trigger: "isIn1",
    }),
    catalog: Object.freeze({
      category: "web-shop",
      enumValue: "02",
      trigger: "isIn2",
    }),
    login: Object.freeze({
      category: "web-shop",
      enumValue: "03",
      trigger: "isIn3",
    }),
    payments: Object.freeze({
      category: "web-shop",
      enumValue: "04",
      trigger: "isIn4",
    }),
    "mobile-account": Object.freeze({
      category: "web-shop",
      enumValue: "05",
      trigger: "isIn5",
    }),
    "loyalty-program": Object.freeze({
      category: "engage",
      enumValue: "01",
      trigger: "isIn21",
    }),
    "referral-program": Object.freeze({
      category: "engage",
      enumValue: "02",
      trigger: "isIn22",
    }),
    "social-quests": Object.freeze({
      category: "engage",
      enumValue: "03",
      trigger: "isIn23",
    }),
    "discord-bot": Object.freeze({
      category: "monetize",
      enumValue: "01",
      trigger: "isIn31",
    }),
    "buy-button": Object.freeze({
      category: "monetize",
      enumValue: "02",
      trigger: "isIn32",
    }),
    offerwall: Object.freeze({
      category: "monetize",
      enumValue: "03",
      trigger: "isIn33",
    }),
    subscriptions: Object.freeze({
      category: "monetize",
      enumValue: "04",
      trigger: "isIn34",
    }),
    sdk: Object.freeze({
      category: "monetize",
      enumValue: "05",
      trigger: "isIn35",
    }),
    "xsolla-liveops": Object.freeze({
      category: "operate",
      enumValue: "01",
      trigger: "isIn41",
    }),
    analytics: Object.freeze({
      category: "operate",
      enumValue: "02",
      trigger: "isIn42",
    }),
    mmp: Object.freeze({
      category: "operate",
      enumValue: "03",
      trigger: "isIn43",
    }),
  });

  const ARTBOARD_SIZE = Object.freeze({ width: 749, height: 335 });
  const DEFAULT_FEATURE = "shop-builder";

  const canvas = document.querySelector("#ecosystem-rive");
  const slot = document.querySelector("#rive-slot");
  const fileLoader = document.querySelector("#rive-file-loader");
  const fileInput = document.querySelector("#rive-file-input");

  if (!canvas || !slot || !window.rive) return;

  let player = null;
  let viewModelInstance = null;
  let enumProperty = null;
  let triggers = new Map();
  let pendingFeature = canvas.dataset.riveState || DEFAULT_FEATURE;
  let activeCategory = null;
  let activeFeature = null;
  let activationToken = 0;
  let resizeFrame = 0;
  let resizeObserver = null;
  let dprQuery = null;
  let disposed = false;

  function setStatus(status, message = "") {
    slot.dataset.riveStatus = status;
    slot.dataset.riveMessage = message;
    slot.dataset.riveRenderer = CONFIG.renderer;
  }

  function setSupported(isSupported) {
    slot.dataset.riveSupported = String(isSupported);
    canvas.setAttribute("aria-hidden", String(!isSupported));
  }

  function queueResize() {
    if (!player || resizeFrame) return;

    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      syncPlayerLayout();
    });
  }

  function syncPlayerLayout() {
    if (!player) return;

    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;

    const needsProportionalFit =
      width < ARTBOARD_SIZE.width - 0.5 ||
      height < ARTBOARD_SIZE.height - 0.5;
    const nextFit = needsProportionalFit ? rive.Fit.Contain : rive.Fit.Layout;

    if (player.layout.fit !== nextFit) {
      player.layout = new rive.Layout({
        fit: nextFit,
        alignment: rive.Alignment.Center,
      });

      if (needsProportionalFit) player.resetArtboardSize();
    }

    slot.dataset.riveFit = needsProportionalFit ? "contain" : "layout";
    player.resizeDrawingSurfaceToCanvas();
  }

  function watchDevicePixelRatio() {
    dprQuery?.removeEventListener("change", handleDprChange);
    dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    dprQuery.addEventListener("change", handleDprChange, { once: true });
  }

  function handleDprChange() {
    queueResize();
    watchDevicePixelRatio();
  }

  function resolveViewModelInstance(categoryBinding) {
    const viewModel = player.viewModelByName(categoryBinding.viewModel);
    if (!viewModel) {
      throw new Error(`View Model “${categoryBinding.viewModel}” was not found.`);
    }

    return (
      viewModel.instanceByName(categoryBinding.viewModelInstance) ||
      viewModel.defaultInstance() ||
      viewModel.instanceByIndex(0) ||
      viewModel.instance()
    );
  }

  function validateRuntimeContract(categoryId) {
    const categoryBinding = CATEGORY_BINDINGS[categoryId];
    if (!categoryBinding) {
      throw new Error(`Rive category “${categoryId}” is not configured.`);
    }

    if (player.activeArtboard !== categoryBinding.artboard) {
      throw new Error(`Artboard “${categoryBinding.artboard}” was not loaded.`);
    }

    if (!player.stateMachineNames.includes(CONFIG.stateMachine)) {
      throw new Error(`State machine “${CONFIG.stateMachine}” was not found.`);
    }

    viewModelInstance = resolveViewModelInstance(categoryBinding);
    player.bindViewModelInstance(viewModelInstance);

    enumProperty = viewModelInstance.enum(categoryBinding.enumProperty);
    if (!enumProperty) {
      throw new Error(
        `Enum property “${categoryBinding.enumProperty}” was not found.`,
      );
    }

    triggers = new Map(
      categoryBinding.features.map((featureId) => {
        const triggerName = FEATURE_BINDINGS[featureId].trigger;
        const property = viewModelInstance.trigger(triggerName);
        if (!property) {
          throw new Error(`Trigger property “${triggerName}” was not found.`);
        }
        return [triggerName, property];
      }),
    );

    const fileEnum = player.enums().find(({ name }) => name === CONFIG.enumName);
    const enumValues = fileEnum?.values || fileEnum?.options || [];
    const expectedValues = categoryBinding.features.map(
      (featureId) => FEATURE_BINDINGS[featureId].enumValue,
    );

    if (
      enumValues.length &&
      expectedValues.some((value) => !enumValues.includes(value))
    ) {
      throw new Error(
        `Enum “${CONFIG.enumName}” does not contain ${expectedValues.join(", ")}.`,
      );
    }
  }

  function bindCategory(categoryId) {
    if (activeCategory === categoryId && enumProperty) return;

    const categoryBinding = CATEGORY_BINDINGS[categoryId];
    if (!categoryBinding) {
      throw new Error(`Rive category “${categoryId}” is not configured.`);
    }

    activationToken += 1;
    activeFeature = null;
    viewModelInstance = null;
    enumProperty = null;
    triggers = new Map();

    if (player.activeArtboard !== categoryBinding.artboard) {
      player.reset({
        artboard: categoryBinding.artboard,
        stateMachines: CONFIG.stateMachine,
        autoplay: true,
        autoBind: false,
      });
    }

    validateRuntimeContract(categoryId);
    activeCategory = categoryId;
    canvas.dataset.riveArtboard = categoryBinding.artboard;
    canvas.dataset.riveViewModel = categoryBinding.viewModel;
    canvas.dataset.riveCategory = categoryId;
    slot.dataset.riveArtboard = categoryBinding.artboard;
    slot.dataset.riveViewModel = categoryBinding.viewModel;
    slot.dataset.riveCategory = categoryId;
    syncPlayerLayout();
  }

  function applyFeature(featureId, { replay = false } = {}) {
    pendingFeature = featureId;
    const binding = FEATURE_BINDINGS[featureId];
    const isSupported = Boolean(binding);
    setSupported(isSupported);

    if (!player || !isSupported) {
      if (player && !isSupported) player.pause(CONFIG.stateMachine);
      activeFeature = null;
      return false;
    }

    try {
      bindCategory(binding.category);
    } catch (error) {
      setStatus("error", error.message);
      console.error("Ecosystem Rive category binding failed:", error);
      return false;
    }

    if (!replay && activeFeature === featureId) return true;

    player.play(CONFIG.stateMachine);
    enumProperty.value = binding.enumValue;
    activeFeature = featureId;
    canvas.dataset.riveState = featureId;
    const token = ++activationToken;

    requestAnimationFrame(() => {
      if (disposed || token !== activationToken || activeFeature !== featureId) {
        return;
      }

      triggers.get(binding.trigger).trigger();
      slot.dataset.riveEnum = binding.enumValue;
      slot.dataset.riveTrigger = binding.trigger;
      slot.dataset.riveActivation = String(
        Number(slot.dataset.riveActivation || 0) + 1,
      );
    });

    return true;
  }

  function handleFeatureChange(event) {
    const featureId = event.detail?.feature;
    if (!featureId) return;
    applyFeature(featureId);
  }

  function handleVisibilityChange() {
    if (!player) return;

    if (document.hidden) {
      player.pause(CONFIG.stateMachine);
    } else if (FEATURE_BINDINGS[pendingFeature]) {
      player.play(CONFIG.stateMachine);
    }
  }

  function initialize(source) {
    setStatus("loading");
    fileLoader.hidden = true;
    disposed = false;

    const sourceParameter =
      source instanceof ArrayBuffer ? { buffer: source } : { src: source };
    const initialBinding =
      FEATURE_BINDINGS[pendingFeature] || FEATURE_BINDINGS[DEFAULT_FEATURE];
    const initialCategory = CATEGORY_BINDINGS[initialBinding.category];

    player = new rive.Rive({
      ...sourceParameter,
      canvas,
      artboard: initialCategory.artboard,
      stateMachines: CONFIG.stateMachine,
      autoplay: true,
      autoBind: false,
      layout: new rive.Layout({
        fit: rive.Fit.Layout,
        alignment: rive.Alignment.Center,
      }),
      onLoad: () => {
        try {
          activeCategory = null;
          activeFeature = null;
          bindCategory(
            (FEATURE_BINDINGS[pendingFeature] || FEATURE_BINDINGS[DEFAULT_FEATURE])
              .category,
          );
          resizeObserver?.disconnect();
          resizeObserver = new ResizeObserver(queueResize);
          resizeObserver.observe(slot);
          watchDevicePixelRatio();
          setStatus("ready");
          applyFeature(pendingFeature, { replay: true });
        } catch (error) {
          setStatus("error", error.message);
          console.error("Ecosystem Rive binding failed:", error);
        }
      },
      onLoadError: (event) => {
        const message = event?.data || String(event || "Unknown Rive load error");
        setStatus("error", message);
        console.error("Ecosystem Rive file failed to load:", message);
      },
    });
  }

  function cleanup() {
    disposed = true;
    activationToken += 1;
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeObserver?.disconnect();
    dprQuery?.removeEventListener("change", handleDprChange);
    player?.cleanup();
    player = null;
  }

  rive.RuntimeLoader.setWasmUrl(
    location.protocol === "file:" ? CONFIG.wasmFileFallback : CONFIG.wasm,
  );
  rive.RuntimeLoader.setWasmFallbackUrl(
    location.protocol === "file:" ? null : CONFIG.wasmFallback,
  );

  document.addEventListener("ecosystem:featurechange", handleFeatureChange);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("resize", queueResize, { passive: true });
  window.addEventListener("pagehide", cleanup, { once: true });

  fileInput?.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".riv")) {
      setStatus("error", "Please choose a .riv file.");
      return;
    }

    initialize(await file.arrayBuffer());
  });

  if (location.protocol === "file:") {
    setStatus("file-required");
    fileLoader.hidden = false;
  } else {
    initialize(CONFIG.file);
  }

  window.ecosystemRive = Object.freeze({
    config: CONFIG,
    categoryBindings: CATEGORY_BINDINGS,
    featureBindings: FEATURE_BINDINGS,
    setFeature: applyFeature,
    get player() {
      return player;
    },
    get viewModelInstance() {
      return viewModelInstance;
    },
    cleanup,
  });
})();
