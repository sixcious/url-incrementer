/**
 * TODO
 */ 

console.log("urlnextplus.js start");
var URLNP = URLNP || {}; // JavaScript Revealing Module Pattern

/**
 * URL Next Plus Object function.
 */ 
URLNP.URLNextPlus = URLNP.URLNextPlus || function () {};

/**
 * The prototype object used to store the URL Next Plus properties.
 */ 
URLNP.URLNextPlus.prototype = {

  enabled: false, // The state is enabled when the user clicks Accept in popup
	tab: null, // The tab object (tab id and tab url)
	selection: "", // The selected part of the URL that will be incremented
	selectionStart: -1, // Start position of the selection relative to the URL
	interval: 1, // The interval to increment (or decrement)
	action: "", // The action to perform: next or prev

  /**
   * Gets enabled.
   * 
   * @return enabled
   */
	getEnabled: function () {
		return this.enabled;
	},

  /**
   * Sets enabled.
   * 
   * @param enabled
   */
	setEnabled: function (enabled) {
		this.enabled = enabled;
	},

  /**
   * Gets tab.
   * 
   * @return tab
   */
	getTab: function () {
		return this.tab;
	},

  /**
   * Sets tab.
   * 
   * @param tab
   */
	setTab: function (tab) {
		this.tab = tab;
	},

  /**
   * Gets selection.
   * 
   * @return selection
   */
	getSelection: function () {
		return this.selection;
	},

  /**
   * Sets selection.
   * 
   * @param selection
   */
	setSelection: function (selection) {
		this.selection = selection;
	},

  /**
   * Gets selectionStart.
   * 
   * @return selectionStart
   */
	getSelectionStart: function () {
		return this.selectionStart;
	},

  /**
   * Sets selectionStart.
   * 
   * @param selectionStart
   */
	setSelectionStart: function (selectionStart) {
		this.selectionStart = selectionStart;
	},

  /**
   * Gets interval.
   * 
   * @return interval
   */
	getInterval: function () {
		return this.interval;
	},

  /**
   * Sets interval.
   * 
   * @param interval
   */
	setInterval: function (interval) {
		this.interval = interval;
	},
	
	  /**
   * Gets action.
   * 
   * @return action
   */
	getAction: function () {
		return this.action;
	},

  /**
   * Sets action.
   * 
   * @param action
   */
	setAction: function (action) {
		this.action = action;
	},

  /**
   * Clears and resets the properties.
   */ 
	clear: function () {
		this.enabled = false;
		this.tab = null;
		this.selection = "";
		this.selectionStart = -1;
		this.interval = 1;
		this.action = "";
	}
	
};