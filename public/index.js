/*
 * College Inclusiveness Search Team
 * February 2025
 *
 * This file gives functionality to the home page,
 * mainly for searching colleges and showing suggested searches.
 */

"use strict";

// anonymous function that runs everything
(function() {
  window.addEventListener("load", init);

  /**
   * Sets up event listeners for the buttons.
   */
  function init() {
    qs("#search-bar .btn").addEventListener("click", searchCollege);
    qs("#search-bar input").addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        searchCollege();
      }
    });
    qs("#search-bar input").addEventListener("input", showSuggestions);
  }

  /**
   * Searches a college based on user input
   */
  function searchCollege() {
    let college = qs("input").value;
    window.location.href = `filter.html?name=${college}`;
  }

  /* --- HELPER FUNCTIONS --- */

  /**
   * Shows search suggestions based on input
   */
  async function showSuggestions() {
    let query = this.value;
    let suggestions = await getRequest("/search/" + query, res => res.json());
    id("suggestions").innerHTML = "";
    for (let i = 0; i < suggestions.length; i++) {
      let option = gen("option");
      option.value = suggestions[i];
      id("suggestions").appendChild(option);
      option.setAttribute("role", "option");
      option.setAttribute("tabindex", "0");
    }
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
      console.error("Post error: ", err);
    }
  }

  /**
   * Handles errors gracefully
   */
  function handleError() {
    alert("There was an issue processing something. Please try again.");
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
   * Returns a new HTML element matching the tag.
   * @param {string} tagName - HTML tag name.
   * @returns {object} - new HTML element matching the tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();