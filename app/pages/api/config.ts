import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method !== "GET") {
    res.status(405).send({
      status: res.statusCode,
      message: "Method Not Allowed",
    });
    return;
  }

  res.json({
    status: res.statusCode,
    config: {
      SMART_ESCROW_ADDRESS: process.env.SMART_ESCROW_ADDRESS ? process.env.SMART_ESCROW_ADDRESS : "0x0",
    },
  });
}
