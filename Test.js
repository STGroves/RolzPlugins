import Utilities from "./PluginUtilities/ToolbarUtilities.js";

Utilities.createButton("table-toolbar", "testBtn", "Test", "#", () => {alert("Test!");});
Utilities.createButton("table-toolbar", "testBtn2", "Test2", "scroll", () => {alert("Test 2!");}, 3);

Utilities.createButton("selection-bar", "testBtn3", "Test3", "@", () => {alert("Test 3!");});
Utilities.createButton("selection-bar", "testBtn4", "Test4", "wallet", () => {alert("Test 4!");}, 2);