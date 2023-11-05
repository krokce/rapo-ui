export default {
  getToken: (state) => {
    return state.tokenValue;
  },
  getTokenIsValid: (state) => {
    return state.tokenIsValid;
  },
  getSearch: (state) => {
    return state.search;
  },
  hideSearch: (state) => {
    return state.hideSearch;
  },
  controlCatalogue: (state) => {
    return state.controlCatalogue;
  },
  controlCatalogueLen: (state) => {
    return state.controlCatalogue.length;
  },
  controlCatalogueById: (state) => (controlId) => {
    return state.controlCatalogue.find(
      (item) => item.control_id === Number(controlId)
    );
  },
  filteredControlCatalogue: (state) => {
    const s = state.search;
    var data = state.controlCatalogue;
    if (s) {
      data = data.filter(
        (item) =>
          item.control_name.toUpperCase().indexOf(s.toUpperCase()) > -1 ||
          item.control_desc.toUpperCase().indexOf(s.toUpperCase()) > -1
      );
    }
    return data;
  },
  controlResults: (state) => {
    return state.controlResults;
  },
  controlResultsLen: (state) => {
    return state.controlResults.length;
  },
  filteredControlResults: (state) => {
    const s = state.search;
    var data = state.controlResults;
    if (s) {
      data = data.filter(
        (item) => item.control_name.toUpperCase().indexOf(s.toUpperCase()) > -1
      );
    }
    return data;
  },
};
