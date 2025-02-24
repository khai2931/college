/*
 * College Inclusiveness Search Team
 * February 2025
 */

"use strict";

(function() {
  window.addEventListener("load", init);

  /**
   * Sets up event listeners for the buttons.
   */
  function init() {
    // todo: initialize event listeners
    id("search-btn").addEventListener("click", searchCollege);
  }

  /**
   * Searches a college based on user input
   */
  function searchCollege() {
    let college = qs("input").value;
    alert("You searched for " + college);
  }

  /* --- HELPER FUNCTIONS --- */

  /**
   * Shows the view and hides all other views
   * @param {string} view - the view to show
   */
  function toggleView(view) {
    for (let i = 0; i < ALL_VIEWS.length; i++) {
      id(ALL_VIEWS[i]).classList.add("hidden");
    }
    id(view).classList.remove("hidden");
  }

  /**
   * returns result of GET request with extractFunc being
   * either res => res.json() or res => res.text()
   * @param {string} url - URL to fetch
   * @param {function} extractFunc - res => res.json() or res => res.text()
   * @returns {object | string | undefined} - res.json(), res.text(), or undefined
   */
  async function getRequest(url, extractFunc) {
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await extractFunc(res);
      return res;
    } catch (err) {
      handleError();
    }
  }

  /**
   * returns result of POST request with extractFunc being
   * either res => res.json() or res => res.text()
   * @param {string} url - URL to fetch
   * @param {object} body - body of POST request
   * @param {function} extractFunc - res => res.json() or res => res.text()
   * @returns {object | string | undefined} - res.json(), res.text(), or undefined
   */
  async function postRequest(url, body, extractFunc) {
    try {
      let res = await fetch(url, {
        method: "POST",
        body: body
      });
      await statusCheck(res);
      res = await extractFunc(res);
      return res;
    } catch (err) {
      handleError();
    }
  }

  /**
   * Handles errors gracefully
   */
  function handleError() {

  }

  /**
   * If res does not have an ok HTML response code, throws an error.
   * Returns the argument res.
   * @param {object} res - HTML result
   * @returns {object} -  same res passed in
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} name - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Returns first element matching selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} - DOM object associated selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns all element matching selector.
   * @param {string} selector - CSS query selector.
   * @returns {object[]} - DOM object associated selector.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Returns a new HTML element matching the tag.
   * @param {string} tagName - HTML tag name.
   * @returns {object} - new HTML element matching the tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();