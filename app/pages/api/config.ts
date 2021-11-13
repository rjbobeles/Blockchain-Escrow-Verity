import type { NextApiRequest, NextApiResponse } from 'next'

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
      BASE_URL: process.env.BASE_URL ? process.env.BASE_URL : "NO_URL_SET",
      SMART_ESCROW_ADDRESS: process.env.SMART_ESCROW_ADDRESS ? process.env.SMART_ESCROW_ADDRESS : "0x0",
    },
  });
}
