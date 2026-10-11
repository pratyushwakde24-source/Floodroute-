# FloodRoute — AWS Setup & Configuration Guide

This guide details how to configure Amazon Web Services (AWS) credentials, IAM permissions, and Amazon Bedrock model access for the **FloodRoute Emergency Mobility Platform**.

---

## 1. Selected AWS Region & Model Architecture

* **Primary AWS Region:** `ap-south-1` (Asia Pacific - Mumbai)
  * *Rationale:* Matches the municipal geography of the flood mobility pilot (Mumbai MCGM grid), minimizing API round-trip latency for field dispatchers.
* **Bedrock Model Identifier:**
  * `anthropic.claude-3-haiku-20240307-v1:0` (Fast, cost-efficient, high structured JSON fidelity)
  * Alternative supported models:
    * `anthropic.claude-3-sonnet-20240229-v1:0`
    * `amazon.titan-text-express-v1`
* **SDK Package:** `@aws-sdk/client-bedrock-runtime` (v3)
* **API Style:** Amazon Bedrock **Converse API** (`ConverseCommand`) with automatic fallback to `InvokeModelCommand`.

---

## 2. Bedrock Model Access Activation in AWS Console

Before calling Bedrock from FloodRoute:

1. Sign in to the **AWS Management Console**.
2. Set your active region to **Asia Pacific (Mumbai) `ap-south-1`** (or your designated region).
3. Open the **Amazon Bedrock** service console.
4. In the left navigation sidebar, scroll down to **Bedrock Configurations** and click **Model access**.
5. Click **Enable specific models** (or **Modify model access**).
6. Select:
   * **Anthropic:** Claude 3 Haiku / Claude 3 Sonnet
   * **Amazon:** Titan Text G1 - Express
7. Click **Next**, review the End User License Agreement (EULA), and submit.
8. Status will update to **Access granted**.

---

## 3. Least-Privilege IAM Policy

Attach the following least-privilege IAM policy to your IAM User or Execution Role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "FloodRouteBedrockConversePolicy",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:ap-south-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
        "arn:aws:bedrock:ap-south-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
        "arn:aws:bedrock:ap-south-1::foundation-model/amazon.titan-text-express-v1"
      ]
    }
  ]
}
```

> [!NOTE]
> No S3, DynamoDB, or Lambda permissions are required for the core Bedrock explanation service.

---

## 4. Local Authentication & Credentials

FloodRoute uses the standard AWS SDK v3 credential provider chain. You can authenticate using any of the following methods:

### Option A: AWS CLI SSO / Temporary Session (Recommended)
```bash
aws configure sso
# Or refresh your existing session:
aws login
```

### Option B: Standard Environment Variables (Server-side only)
Place in your local `.env` file (never commit to version control):
```ini
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
# If using temporary credentials / IAM role assume:
AWS_SESSION_TOKEN=AQoDYXdzEJr1...
```

---

## 5. Offline & Fallback Safeguards

If AWS credentials are unconfigured, expired, or model access has not yet been granted:

1. FloodRoute **NEVER crashes** and **NEVER halts emergency routing**.
2. The deterministic safety engine automatically handles routing via the verified Dijkstra bypass corridor.
3. The dashboard and 3D city scene display:
   > `AI explanation unavailable — deterministic routing remains active.`
4. The system reports `status: "FALLBACK_DETERMINISTIC"` with exact physical reasons (e.g. water depth 85cm > vehicle clearance 60cm).

---

## 6. Estimated Hackathon Cost Analysis

* Bedrock Claude 3 Haiku pricing in `ap-south-1`:
  * Input tokens: ~$0.00025 per 1,000 tokens.
  * Output tokens: ~$0.00125 per 1,000 tokens.
* Per emergency dispatch explanation:
  * ~350 prompt tokens + ~150 response tokens ≈ **$0.00028 per explanation** (< 1/30th of a cent).
  * 1,000 demo simulations cost approximately **$0.28 total**.
