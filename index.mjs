import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "./sesClient.mjs";

const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .alert-box {
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border-left: 5px solid;
    }
    .low {
      background-color: #e8f4f8;
      border-color: #4a90e2;
    }
    .medium {
      background-color: #fff3cd;
      border-color: #ffc107;
    }
    .high {
      background-color: #ffe5e5;
      border-color: #ff6b6b;
    }
    .critical {
      background-color: #ffebee;
      border-color: #d32f2f;
      font-weight: bold;
    }
    .severity-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 4px;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 12px;
    }
    .severity-badge.low { background-color: #4a90e2; color: white; }
    .severity-badge.medium { background-color: #ffc107; color: #333; }
    .severity-badge.high { background-color: #ff6b6b; color: white; }
    .severity-badge.critical { background-color: #d32f2f; color: white; }
    .timestamp {
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="alert-box {{severityClass}}">
    <h2>Security Alert Notification</h2>
    <p><span class="severity-badge {{severityClass}}">{{severity}}</span></p>
    <p class="timestamp"><strong>Timestamp:</strong> {{timestamp}}</p>
    <div style="margin-top: 20px;">
      {{message}}
    </div>
  </div>
</body>
</html>
`;

const severityToClass = (sev) => {
  switch (sev.toLowerCase()) {
    case "low": return "low";
    case "medium": return "medium";
    case "high": return "high";
    case "critical": return "critical";
    default: return "low";
  }
};

const createSendEmailCommand = (receiver, subject, htmlContent) => {
  return new SendEmailCommand({
    Destination: { ToAddresses: [receiver] },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlContent,
        },
      },
      Subject: { Data: subject },
    },
    Source: "adityapandey2395@protonmail.com",
  });
};

const replacePlaceholders = (template, replacements) => {
  return template.replace(/{{(\w+)}}/g, (_, key) => replacements[key] || "");
};

export const handler = async (event) => {
  try {
    // Validate event structure
    if (!event.Records || !event.Records[0] || !event.Records[0].Sns) {
      throw new Error("Invalid SNS event structure");
    }

    const snsInfo = event.Records[0].Sns;

    // Parse and validate message
    const replacements = JSON.parse(snsInfo.Message);
    
    // Validate required fields
    if (!snsInfo.MessageAttributes?.severity?.Value || 
        !snsInfo.MessageAttributes?.to?.Value || 
        !snsInfo.MessageAttributes?.subject?.Value) {
      throw new Error("Missing required MessageAttributes");
    }

    const severity = snsInfo.MessageAttributes.severity.Value;
    const severityClass = severityToClass(severity);

    const fullReplacements = {
      ...replacements,
      severity,
      severityClass,
    };

    const htmlContent = replacePlaceholders(htmlTemplate, fullReplacements);

    const sendEmailCommand = createSendEmailCommand(
      snsInfo.MessageAttributes.to.Value,
      snsInfo.MessageAttributes.subject.Value,
      htmlContent
    );

    const sendData = await sesClient.send(sendEmailCommand);
    console.log("Email sent successfully:", sendData.MessageId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ messageId: sendData.MessageId })
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
