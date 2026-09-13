# SHIBAURA Machine Specifications

## Overview
The SHIBAURA Injection Molding system is designed for high precision manufacturing. 
Below is a reference image of the operator control panel, which controls clamping force, melt temperature, and injection pressure.

![SHIBAURA Control Panel](/dataset/images/shibaura_control_panel.jpg)

## Diagnostics & Alarms
If the machine encounters a fault, it will display an alarm code on the primary screen.

### Alarm Code: E101
**Description**: Injection Unit Pressure Fault
**Severity**: High
**Role Access**: ENGINEER, ADMIN

**Troubleshooting Steps**:
1. Immediately press the Emergency Stop button.
2. Check the hydraulic filter for blockages.
3. Verify the servo valve functionality using the diagnostics menu.
4. Do not attempt to reset the alarm without clearing the blockage.

### Alarm Code: T205
**Description**: Melt Temperature Deviation
**Severity**: Warning
**Role Access**: OPERATOR, ENGINEER, ADMIN

**Troubleshooting Steps**:
1. Check the heater bands for proper operation.
2. Ensure the temperature profile matches the selected resin type.
3. The operator can acknowledge the warning and continue if deviation is under 5°C.
