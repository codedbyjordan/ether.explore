const buildEndpoint = () => {
  let query = document.getElementById("query").value;
  let queryType = document.getElementById("query-type").value;

  // no xss, thanks.
  query = query.replace(/[^a-zA-Z0-9]/g, "");
  queryType = queryType.replace(/[^a-zA-Z0-9]/g, "");

  window.location = `${window.location.origin}/${queryType}/${query}`;
};
