import { useEffect, useState } from "react";

import { attackProfiles } from "./attackProfiles";
import { useSimulationMode } from "../context/SimulationContext";

import { generateTraffic } from "./trafficGenerator";
import { generateAIEngine } from "./aiEngine";
import {
  generateIncidentResponse,
} from "./incidentResponse";
import {
  generateLog,
  generateAlert,
} from "./eventGenerator";
import { generateHealth } from "./healthGenerator";


// ============================================================
// ATTACK PHASE
// ============================================================

function getAttackPhase(progress) {

  if (progress < 0.15) {
    return "Starting";
  }

  if (progress < 0.45) {
    return "Growing";
  }

  if (progress < 0.80) {
    return "Peak";
  }

  return "Recovery";
}


// ============================================================
// CHOOSE NEXT ATTACK
// ============================================================

function chooseNextAttack() {

  const totalWeight =
    attackProfiles.reduce(
      (sum, attack) =>
        sum + attack.probability,
      0
    );

  let random =
    Math.random() * totalWeight;

  for (const attack of attackProfiles) {

    random -= attack.probability;

    if (random <= 0) {
      return attack;
    }

  }

  return attackProfiles[0];
}


// ============================================================
// CREATE INITIAL SIMULATION STATE
// ============================================================

export function createSimulationState() {

  const scenario =
    chooseNextAttack();

  return {

    scenario,

    elapsed: 0,

    uptime: 0,


    // --------------------------------------------------------
    // Attack state
    // --------------------------------------------------------

    attackState: {

      type:
        scenario.name,

      severity:
        scenario.severity,

      phase:
        "Starting",

      progress:
        0,

      elapsed:
        0,

      duration:
        scenario.duration,

    },


    // --------------------------------------------------------
    // Attack episode
    //
    // Every time a completely new attack scenario begins,
    // this number increases.
    //
    // This allows us to create ONE alert per attack episode.
    // --------------------------------------------------------

    attackEpisode:
      1,


    // --------------------------------------------------------
    // Dashboard data
    // --------------------------------------------------------

    traffic:
      null,

    ai:
      null,

    incident:
      null,

    logs:
      [],

    alerts:
      [],

    chart:
      [],

    health:
      null,

  };

}


// ============================================================
// UPDATE ATTACK STATE
// ============================================================

export function updateAttackState(state) {

  const elapsed =
    state.elapsed + 1;


  let scenario =
    state.scenario;


  let attackElapsed =
    state.attackState.elapsed + 1;


  let attackEpisode =
    state.attackEpisode;


  // ----------------------------------------------------------
  // ATTACK FINISHED
  // ----------------------------------------------------------

  if (
    attackElapsed >=
    scenario.duration
  ) {

    scenario =
      chooseNextAttack();

    attackElapsed =
      0;


    // New attack episode

    attackEpisode =
      state.attackEpisode + 1;

  }


  // ----------------------------------------------------------
  // ATTACK PROGRESS
  // ----------------------------------------------------------

  const progress =
    attackElapsed /
    scenario.duration;


  return {

    ...state,


    scenario,


    elapsed,


    uptime:
      state.uptime + 1,


    attackEpisode,


    attackState: {

      type:
        scenario.name,

      severity:
        scenario.severity,

      elapsed:
        attackElapsed,

      duration:
        scenario.duration,

      progress,


      phase:
        getAttackPhase(
          progress
        ),

    },

  };

}


// ============================================================
// SIMULATION HOOK
// ============================================================

export function useSimulation() {

  const [
    simulation,
    setSimulation
  ] = useState(
    createSimulationState()
  );


  const {
    mode
  } =
    useSimulationMode();


  // ==========================================================
  // DEMO MODE
  // ==========================================================

  useEffect(() => {

    if (
      mode !== "demo"
    ) {

      return;

    }


    const timer =
      setInterval(() => {

        setSimulation(
          prev => {

            // ------------------------------------------------
            // Update attack state
            // ------------------------------------------------

            const state =
              updateAttackState(
                prev
              );


            // ------------------------------------------------
            // Detect whether a NEW attack episode started
            // ------------------------------------------------

            const newAttackEpisode =
              state.attackEpisode !==
              prev.attackEpisode;


            // ------------------------------------------------
            // Generate traffic
            // ------------------------------------------------

            const traffic =
              generateTraffic(
                state.attackState
              );


            // ------------------------------------------------
            // AI ENGINE
            // ------------------------------------------------

            const ai =
              generateAIEngine(
                traffic,
                state.attackState
              );


            // ------------------------------------------------
            // INCIDENT RESPONSE
            // ------------------------------------------------

            const incident =
              generateIncidentResponse(
                state.attackState
              );


            // ------------------------------------------------
            // SECURITY LOG
            //
            // Logs continue to update every second because
            // they represent the current activity.
            // ------------------------------------------------

            const log =
              generateLog(
                traffic,
                state.attackState
              );


            // ------------------------------------------------
            // HEALTH
            // ------------------------------------------------

            const health =
              generateHealth(
                state.uptime
              );


            // ------------------------------------------------
            // NEW ALERT
            //
            // IMPORTANT:
            //
            // We ONLY create a new alert when a new attack
            // episode starts.
            //
            // Therefore a 15-second attack creates ONE alert,
            // not 15 alerts.
            // ------------------------------------------------

            let alerts =
              prev.alerts;


            if (
              newAttackEpisode
            ) {

              // ----------------------------------------------
              // Resolve previous active alert
              // ----------------------------------------------

              alerts =
                prev.alerts.map(
                  (existingAlert) => {

                    if (
                      existingAlert.status ===
                      "Investigating"
                    ) {

                      return {

                        ...existingAlert,

                        status:
                          "Resolved",

                      };

                    }


                    return existingAlert;

                  }
                );


              // ----------------------------------------------
              // Create ONE alert for the new attack
              // ----------------------------------------------

              const alert =
                generateAlert(
                  traffic,
                  state.attackState
                );


              alerts = [
                alert,
                ...alerts,
              ];

            }


            // ------------------------------------------------
            // Limit alert history
            // ------------------------------------------------

            alerts =
              alerts.slice(
                0,
                50
              );


            // ------------------------------------------------
            // CHART POINT
            // ------------------------------------------------

            const point = {

              time:
                new Date()
                  .toLocaleTimeString(
                    [],
                    {
                      minute:
                        "2-digit",

                      second:
                        "2-digit",
                    }
                  ),


              packets:
                traffic.packetsPerSecond,


              benign:
                traffic.benignPackets,


              malicious:
                traffic.maliciousPackets,

            };


            // ------------------------------------------------
            // RETURN NEW STATE
            // ------------------------------------------------

            return {

              ...state,


              traffic,


              ai,


              incident,


              health,


              // Logs update every second

              logs:
                [
                  log,
                  ...prev.logs,
                ].slice(
                  0,
                  50
                ),


              // Alerts update ONLY when a new attack begins

              alerts,


              // Chart updates every second

              chart:
                [
                  ...prev.chart,
                  point,
                ].slice(
                  -60
                ),

            };

          }
        );

      }, 1000);


    // ========================================================
    // CLEANUP
    // ========================================================

    return () =>
      clearInterval(timer);

  }, [mode]);


  return simulation;

}