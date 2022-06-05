# Allow default exports to pass.
PATTERN_1="default"

if npx ts-prune | grep -vE "$PATTERN_1|$PATTERN_2|$PATTERN_3|$PATTERN_4"; then
    echo "🚨 Found unused code ☝️"
    echo ""
    exit 1
else
    exit 0
fi
