import axios from "axios";

const handleApiCall = async (props) => {
  const { API, data, APIURL, host, port, method = "POST" } = props;
  const hostname = new URL(window.location.href).hostname;
  const finalURL =
    APIURL || `http://${host || hostname}:${port || 5000}/${API}`;

  try {
    const config = {
      method: method, // POST, GET, PUT, DELETE, etc.
      url: finalURL,

      data: method === "POST" || method === "PUT" ? { data } : undefined, // Send data only for POST/PUT requests
    };

    const result = await axios(config);

    if (result.status === 200) {
      return { data: result.data, flag: true };
    } else {
      return { error: result.data?.message || "Unknown error", flag: false };
    }
  } catch (error) {
    return {
      error:
        error?.response?.data?.message || error?.message || "API call failed",
      flag: false,
    };
  }
};

export default handleApiCall;
