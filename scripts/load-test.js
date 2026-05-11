/* eslint-disable @typescript-eslint/naming-convention */
/* global __ENV */
import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

export const options = {
  stages: [
    { duration: "1m", target: 20 },
    { duration: "2m", target: 50 },
    { duration: "1m", target: 0 },
  ],
};

const BASE_URL = __ENV.BASE_URL || "http://dam";

export default function () {
  group("DAM Performance Test", () => {
    // 1. Login and get the Token
    const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, {
      email: "admin@dam.com",
      password: "Admin1234",
    });

    const loginSuccess = check(loginRes, {
      "logged in successfully": (r) => r.status === 200,
    });

    if (loginSuccess && loginRes.json().token) {
      const token = loginRes.json().token;

      // 2. Fetch assets using the Token
      const params = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const apiRes = http.get(`${BASE_URL}/api/v1/assets`, params);
      const success = check(apiRes, {
        "assets fetched": (r) => r.status === 200,
      });

      if (!success) {
        errorRate.add(1);
      }
    } else {
      errorRate.add(1);
    }

    sleep(1);
  });
}
