import axios from "axios";
import RegisterCourseService from "../Services/RegisterCourseService.js";
import mongoose from "mongoose";

//Chuyển đổi tỷ giá tiền sang USD

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

/**
 * Lấy Access Token từ PayPal
 */
const getPayPalAccessToken = async () => {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString(
    "base64"
  );

  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
};

/**
 * Tạo PayPal order
 */
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // Lấy số tiền từ client (mặc định là VND)
    const accessToken = await getPayPalAccessToken();

    const amountCurrency = Number.parseInt(amount);

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            value: amountCurrency.toFixed(2), // Làm tròn 2 chữ số thập phân
            currency_code: "USD", // Luôn gửi yêu cầu với USD
          },
        },
      ],
    };

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(201).json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Create Paypal order failed" });
  }
};

/**
 * Xác nhận thanh toán (capture order)
 */
const captureOrder = async (req, res) => {
  try {
    const { registrationId } = req.params; // Lấy orderId từ URL
    const { paymentId } = req.body;

    if (!registrationId || !paymentId) {
      return res
        .status(400)
        .json({ message: "RegistrationId and paymentId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(registrationId)) {
      return res.status(400).json({ message: "RegisterId is invalid" });
    }

    const accessToken = await getPayPalAccessToken();

    // Lấy chi tiết đơn hàng từ cơ sở dữ liệu
    const registerFindResult =
      await RegisterCourseService.getRegisteredCourseById(registrationId);

    if (!registerFindResult) {
      return res.status(404).json({ message: "Registration is not existed" });
    }

    // Thực hiện capture thanh toán PayPal
    const captureResponse = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${paymentId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const captureData = captureResponse.data;

    // Kiểm tra trạng thái thanh toán
    switch (captureData.status) {
      case "COMPLETED":
        // Update the payment status of the order
        const updateResult = await RegisterCourseService.updateRegistrationStatus(registrationId, "Confirmed");

        if (!updateResult) {
          return res
            .status(500)
            .json({ message: "Failed to update payment status for the registration" });
        }

        return res.status(200).json({
          message: "Payment successful and the order has been updated",
          registration: updateResult,
        });

      case "PENDING":
        return res
          .status(202)
          .json({ message: "Payment is processing, please wait" });

      case "DECLINED":
        return res
          .status(400)
          .json({ message: "Payment was declined, please try again" });

      case "FAILED":
        return res
          .status(400)
          .json({ message: "Payment failed, please check your information" });

      default:
        return res
          .status(500)
          .json({ message: `Unknown status: ${captureData.status}` });
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({
      error: "An error occurred while processing PayPal payment",
      details: error.response?.data || error.message,
    });
  }
};

export default {
  createOrder,
  captureOrder,
}
