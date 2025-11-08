# Notification Service Lambda

This project is used to send email notifications after an event is published on AWS SNS, which triggers a Lambda function that uses the AWS SES client. It is a part of a logging and notification system. The primary language is JavaScript.

## Features
- Send email notifications via AWS SES
- Trigger notifications from AWS SNS events
- Scalable and serverless architecture using AWS Lambda
- Easy configuration and management

## Prerequisites
- AWS Account
- AWS CLI installed and configured
- Node.js installed

## Deployment
1. Configure your AWS credentials.
2. Deploy the Lambda function using AWS Management Console or AWS CLI.
3. Subscribe the Lambda function to your SNS topic.

## Usage
- Publish an event to your SNS topic to trigger the Lambda function and send an email notification.

## Configuration
- Update the Lambda function environment variables for AWS SES configuration.
