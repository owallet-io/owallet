export const WHITELISTED_IPS = ["125.212.192.225", "222.252.31.239"];

export interface GeoInfo {
  ip: string;
  country: string;
  en_name: string;
}

export const checkGeoBlocked = async (): Promise<boolean> => {
  try {
    const response = await fetch("https://geo.oraidex.io/country");

    // Requirement 1: If 403 and server is cloudflare, default to block (return true)
    if (response.status === 403) {
      const serverHeader = response.headers.get("server");
      if (serverHeader?.toLowerCase().includes("cloudflare")) {
        return true;
      }
    }

    if (!response.ok) {
      // If other error occur, fallback to ipinfo.io
      return await checkFallbackGeo();
    }

    const data: GeoInfo = await response.json();

    if (WHITELISTED_IPS.includes(data.ip)) {
      return false;
    }

    return data.country === "VN";
  } catch (error) {
    console.error("Primary geo-check failed, trying fallback:", error);
    return await checkFallbackGeo();
  }
};

const checkFallbackGeo = async (): Promise<boolean> => {
  try {
    const response = await fetch("https://ipinfo.io/json");
    if (!response.ok) {
      return false;
    }
    const data = await response.json();

    if (WHITELISTED_IPS.includes(data.ip)) {
      return false;
    }

    return data.country === "VN";
  } catch (error) {
    console.error("Fallback geo-check failed:", error);
    return false;
  }
};
