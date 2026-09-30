window.INCLASS_CONFIG = {
  release: "2026.09.29.5",
  mode: "local",
  firebase: {
    enabled: false,
    // Populate these when the Firebase project is connected.
    // Keep secrets out of source control; Firebase web config is an app identifier,
    // while privileged credentials must stay server-side.
    config: null
  },
  demoProfile: {
    userId: "local-parent",
    displayName: "Parent",
    role: "parent",
    children: [
      { id: "sai", name: "Sai", yearGroup: "Year 5" }
    ],
    classes: []
  }
};