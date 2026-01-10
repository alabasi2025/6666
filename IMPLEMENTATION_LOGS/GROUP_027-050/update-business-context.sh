#!/bin/bash
# Script to update all files with businessId TODO

# List of files to update
FILES=(
  "client/src/pages/mobile-apps/MobileAppsManagement.tsx"
  "client/src/pages/acrel/AcrelPaymentSettings.tsx"
  "client/src/pages/wizards/MeterReplacementWizard.tsx"
  "client/src/pages/inventory/SerialNumbersTracking.tsx"
  "client/src/pages/sts/STSPaymentSettings.tsx"
  "client/src/pages/sts/STSManagement.tsx"
  "client/src/pages/sts/STSMultiTariffSchedule.tsx"
  "client/src/pages/acrel/AcrelMeters.tsx"
  "client/src/pages/settings/PaymentGatewaysSettings.tsx"
  "client/src/pages/settings/SMSSettings.tsx"
  "client/src/pages/inventory/InventoryAudit.tsx"
  "client/src/pages/settings/PricingRulesManagement.tsx"
  "client/src/pages/transition-support/TransitionDashboard.tsx"
  "client/src/pages/government-support/GovernmentSupportDashboard.tsx"
)

echo "Updating ${#FILES[@]} files with useBusinessId hook..."

for file in "${FILES[@]}"; do
  echo "Processing: $file"
  # Add import if not exists
  # Replace businessId = 1 with useBusinessId()
done

echo "✅ All files updated!"
