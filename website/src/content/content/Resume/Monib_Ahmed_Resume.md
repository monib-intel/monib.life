---
title: Monib Ahmed - Resume
description: Sixteen years in the semiconductor industry, adept at turning architectural ideas into reliable silicon
type: resume
---

# Monib Ahmed

**Contact:** 480.444.6853 | ahmmonib@gmail.com | [linkedin.com/in/monibahmed](https://www.linkedin.com/in/monibahmed/) | Portland, Oregon

---

## Professional Summary

Sixteen years in the semiconductor industry, adept at turning architectural ideas into reliable silicon. Skilled in enhancing team and organizational performance, with expertise in design flows, tool use, and automation. Proven ability to lead projects, influence peers, and solve challenging problems to advance technology. Seeking to expand my project execution and leadership experience.

## Proven Strengths

- Execution Planning
- Failure Analysis
- Product Development
- Communication
- Cross Team Collaboration
- Problem Solving

## Technical Expertise

- **Programming Skills:** System Verilog, TCL, Perl, C, C++, Python, Rust, Haskell
- **Design Tools:** Cadence Analog Design, Synopsys Digital Design Environments, Tessent
- **Methodologies:** Mixed Signal Top-Down/Bottom-Up Design Flow and Verification Techniques, Silicon Design and Debug

---

## Work Experience

### XCHIP Digital Methodology Lead
**Intel Corporation** | Hillsboro, OR | April 2018 – Present

Transformed IP development by implementing digital-centric methods, boosting efficiency from design to validation. Worked across multiple IPs and utilized resources from various organizations to modernize the analog and digital handoff. Introduced scalable, modular flows that reduced iterations and hastened time-to-market.

* Championed IJTAG adoption across IPs, enabled automated flow for generation register collateral across Pre-Silicon and Post-Silicon design and validation execution
* Implemented uniform IJTAG register access framework which facilitated the reuse of designs across multiple IPs, and project nodes, optimizing resource utilization and consistency. Improving testing and debug throughput
* Scaling centralized documentation system to allow automated design and validation documentation and test plans
* Drove adoption of digital centric place and route methodologies to facilitate IP design and integration. Currently driving towards scaling across multiple nodes and IPs.
* Led the adoption of digital design and validation tools, enhancing the accuracy of front-end collateral and the quality of back-end execution, such as enabling Fusion Compiler for Floor-planning, VCLP for Power Checks, Fishtail, and CDC
* Established a behavioral modeling framework for analog design, setting reproducible execution standards and contributing to the on-time delivery of multiple critical projects
* Architected a Python-based lab environment, fostering proactive test code development and broadening pre-silicon validation capabilities across the organization. Proliferated AI usage to help with coding tasks and structure
* Significantly improved sort pattern creation, halving the time needed and, in some instances, completely removing the requirement for simulation, thereby accelerating the debugging process and streamlining the development workflow.

Executed on PNR for Meteor-Lake 10nm Atom design. Closed timing, DRCs and RV issues to ensure successful Tape-In.

* Enabled Primetime ECO/DMSA flow for full project, leading to efficient timing closure across partitions.
* Enabled flat-core Atom runs across Intel 20A to enable higher quality collateral generation and faster build times.
* Drove RV methodology across multiple partitions, found issues with PG grid at global level and implemented fixes.

Validated mixed signal designs, bringing up UVM/Mixed signal test suite and debugging failures. Aligned analog schematic and digital behavioral modeling. Built a new Schematic versus Behavioral Model tool to automate test bench creation to show open loop health of mixed-signal design.

* Implemented RTL Quality tools to fortify code integrity, enhance testability, and resolve clock domain issues.
* Validated open-loop architecture using a custom C++ tool for schematic and behavioral model comparison.
* Promoted design efficiency and collaboration through top-down mixed-signal methodology training.
* Built and validated test benches to ensure system accuracy before extensive regression testing.
* Synchronized behavioral modeling with schematic timing using SPEF and POLO extractions for robust design validation.
* Detected and fixed four critical pre-tape-out bugs via gate-level simulations, increasing design reliability.
* Improved scan coverage by 22% with targeted scan ECOs and innovated analog scan architectures for next-gen designs.
* Maintained project continuity and met deliverables despite a 35% staff reduction by covering multiple technical domains.

### Mixed Signal Product Development Engineer
**Atlazo Inc** | San Diego, CA | 2016 – 2018

Founding Member of IoT business focusing on Smart Ultra-Low Power Platforms. Enabled verification of PMIC by coding mixed signal behavioral models and testbenches

* Enhanced verification efforts by modeling specific blocks by using analog modeling techniques in System Verilog, ensuring a high-quality tape out in less than one year.
* Provided a method of open loop testing of buck converter in silicon, enabling faster path to power-on.
* Enhanced UVM test coverage by writing SV Assertions for checking analog functionality, 12 bugs root caused.
* Enabled design flows by enabling servers, tools and design flows.
* Coded test sequences in C/C++ to enable code re-use during power on and lab debug.
* Successfully tape-out 3 PMICs on 40nm ULP Process, by effectively bridging analog and digital design teams.
* Researched and implemented machine learning algorithms using Python, Jupyter, Scikit-Learn and FastAI frameworks for natural language processing and image recognition.

### Mixed Signal Verification Engineer
**Dialog Semiconductor** | PMIC Design Group | Chandler, AZ | 2015 – 2016

Verified PMIC and Charger Designs in domestic and international design centers. Verified closed loops digital designs of Buck Converters utilizing mixed-signal simulation and modeling methodologies. Hired qualified engineers to build a strong team.

* Enabled design verification by coding behavioral models for PMIC designs, specifically LDOs and BGRs.
* Improved PMIC design health by coding and executing 17 mixed signal test cases in TCL.
* Developed methodology to stop and restart simulations without having to go through a full reset.
* Created prototype designs by implementing feedback design system and digital signal processing on digital controllers.
* Completed a complex design project that was in danger of falling behind by traveling abroad and supporting the project.

### SoC RTL Design Engineer
**Intel Corporation** | Digital Home Group | Chandler, AZ / Austin, TX | 2008 – 2015

Digital design experience taping out 5 families of SoCs. Increased process efficiencies, root caused multiple bugs and closed multiple designs.

* Certified SoC for NAGRA/NDS scrambling, architected DFx and Fuse security to cover security risks.
* Designed and implemented a full-featured On-Die Logic Analyzer to reduce validation and debug costs.
* Resolved full-chip Soc issues by collaborating across multiple design disciplines.
* Resolved > 250K timing paths for DFx related paths, by providing constraints and exceptions.
* Reduced DFx implementation time from 4 weeks to 3 days, by leading a team to automate integration of physical design driven changes into RTL.
* Closed DFx Architecture by collaborating across teams to ensure testability during manufacturing.
* Successfully closed physical design flows for multiple 14nm partitions, driving closure of partitions from floor-planning to GDS, wrote TCL based scripts to automate solutions.
* Engaged with Front-End RTL team to close timing and streamline flows for efficient hand-off of collateral.

#### Debug Engineer
First line process debug on 14nm technology

* Conducted laser-based debugging of 14nm silicon wafers, isolating and resolving scan chain issues.
* Developed experiments to pinpoint silicon defects, leading to effective physical ECO implementations.
* Addressed two pervasive 14nm defects, enhancing yield by 98% through collaborative design optimizations.
* Quickly diagnosed and fixed a critical power-on reset issue using the chip's debug capabilities.

---

## Education

**Master of Science in Electrical Engineering:** Mixed Signal Circuit Design, Arizona State University, Tempe, AZ - 2014

---

## Patents

### Granted Patents

**US10811968** - Power Management System (October 20, 2020)
DC-DC power converter with selectively activated switches for converting voltage and current, using comparator-based threshold control for power cycle management. *Assignee: ATLAZO, INC.*

**US9922720** - Random Fuse Sensing (March 20, 2018)
Randomizes fuse sensing order to prevent unauthorized determination of storage element values, creating more secure storage devices. *Assignee: Intel Corporation*

**US9472302** - Redundant Fuse Coding (October 18, 2016)
Writes fuse information into arrays with sufficient redundancy, making it harder for malicious parties to attack the fuse array. *Assignee: Intel Corporation*

**US9292713** - Tiered Access to On-Chip Features (March 22, 2016)
Multiple blind debug passwords system where each entity has unique password unlocking specific integrated circuit features, with hierarchical tier access requiring multiple passwords for intrusive operations. *Assignee: Intel Corporation*

**US8971137** - Bit Based Fuse Repair (March 3, 2015)
Reserves fuse array area for storing defective bit addresses, enabling repair by inverting stored states of identified defective bits. *Assignee: Intel Corporation*

**US8923030** - On-Die Programmable Fuses (December 30, 2014)
On-die programmable fuses that can be programmed by entities other than the chip manufacturer after manufacturing and shipping. *Assignee: Intel Corporation*

### Patent Applications

**20220011795** - Device-Specific Supply Voltage Control (Filed: September 27, 2021)
Control apparatus for determining device-specific supply voltage based on aging measurement data of semiconductor devices.

**20210021193** - Power Management System (Filed: October 1, 2020)
DC-DC power converter with four-switch architecture and comparator-based voltage threshold control.
