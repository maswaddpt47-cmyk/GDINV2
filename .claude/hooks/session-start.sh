#!/bin/bash
# Session start hook — GDINV2 : rappel de ménage de CHANTIERS.md (MD-LIB collaboration.md 8ter).
bash "$CLAUDE_PROJECT_DIR/scripts/check-chantiers.sh" "$CLAUDE_PROJECT_DIR/CHANTIERS.md"
exit 0
