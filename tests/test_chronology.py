"""Chronology topology and postselection toy tests. No physical CTC claims."""
import json
import math
from pathlib import Path
import unittest

from phichronos.chronology import quotient_analysis, winding_history
from phichronos.postselection import postselected_cnot


class ChronologyTests(unittest.TestCase):
    def test_spacelike_spatial_cylinder(self):
        r = quotient_analysis(0, 4)
        self.assertEqual(r["generator_type"], "spacelike")
        self.assertFalse(r["closed_timelike_generator"])
        self.assertIsNone(r["proper_time_per_winding_seconds"])
        self.assertAlmostEqual(r["norm_light_seconds_squared"], -16)

    def test_timelike_periodic_time(self):
        r = quotient_analysis(5, 0)
        self.assertEqual(r["generator_type"], "timelike")
        self.assertTrue(r["closed_timelike_generator"])
        self.assertAlmostEqual(r["proper_time_per_winding_seconds"], 5)

    def test_tilted_timelike(self):
        r = quotient_analysis(5, 3)
        self.assertEqual(r["generator_type"], "timelike")
        self.assertAlmostEqual(r["proper_time_per_winding_seconds"], 4)
        self.assertAlmostEqual(r["norm_light_seconds_squared"], 16)

    def test_closed_null_not_ctc(self):
        r = quotient_analysis(5, 5)
        self.assertEqual(r["generator_type"], "null")
        self.assertTrue(r["closed_null_generator"])
        self.assertFalse(r["closed_timelike_generator"])

    def test_past_signed_orientation(self):
        r = quotient_analysis(-5, 3)
        self.assertEqual(r["generator_type"], "timelike")
        self.assertAlmostEqual(r["proper_time_per_winding_seconds"], 4)

    def test_scale_invariance(self):
        reference = quotient_analysis(4, 3)
        for factor in (0.1, 2, 10, 100):
            with self.subTest(factor=factor):
                result = quotient_analysis(4*factor, 3*factor)
                self.assertEqual(result["generator_type"], reference["generator_type"])
                self.assertAlmostEqual(result["norm_light_seconds_squared"],
                                       reference["norm_light_seconds_squared"]*factor*factor)

    def test_windings(self):
        turns = winding_history(5, 3, 3)
        self.assertEqual(len(turns), 3)
        self.assertEqual(turns[-1]["covering_endpoint"]["ct_light_seconds"], 15)
        self.assertAlmostEqual(turns[-1]["timelike_proper_time_seconds"], 12)

    def test_invalid_generator(self):
        for vector in ((0, 0), (float("nan"), 1), (1, float("inf"))):
            with self.subTest(vector=vector), self.assertRaises(ValueError):
                quotient_analysis(*vector)
        for turns in (0, -1, 21, 2.5, True):
            with self.subTest(turns=turns), self.assertRaises(ValueError):
                winding_history(5, 3, turns)


class PostselectionTests(unittest.TestCase):
    def test_zero_probability_has_no_conditional_output(self):
        out = postselected_cnot(0, shots=20)
        self.assertEqual(out["expected_accepted_trials"], 0)
        self.assertTrue(out["undefined_when_success_probability_zero"])
        self.assertIsNone(out["conditional_output_probability_zero"])

    def test_full_probability(self):
        out = postselected_cnot(1, shots=20)
        self.assertEqual(out["expected_accepted_trials"], 20)
        self.assertEqual(out["expected_discarded_trials"], 0)
        self.assertEqual(out["conditional_output_probability_zero"], 1)

    def test_superposition_half(self):
        out = postselected_cnot(0.5, shots=1000)
        self.assertAlmostEqual(out["success_probability"], 0.5)
        self.assertAlmostEqual(out["expected_accepted_trials"], 500)

    def test_conservation_of_expected_trial_count(self):
        for p in (0.001, 0.1, 0.2, 0.75, 0.999):
            o = postselected_cnot(p, shots=120)
            self.assertAlmostEqual(o["expected_accepted_trials"] + o["expected_discarded_trials"], 120)

    def test_invalid_postselection_inputs(self):
        for p in (-0.1, 1.1, float("nan"), float("inf")):
            with self.subTest(p=p), self.assertRaises(ValueError):
                postselected_cnot(p)
        for shots in (0, -1, 1.1, True, 1000001):
            with self.subTest(shots=shots), self.assertRaises(ValueError):
                postselected_cnot(0.5, shots)

    def test_bell_contraction_for_cnot(self):
        # In the basis |S,L,R>, start |psi>_S ⊗ (|00>+|11>)/sqrt(2)_LR.
        # CNOT(S -> L) followed by <Phi+|_LR gives amplitude a|0>_S.
        for p0 in (0.0, 0.2, 0.5, 1.0):
            a = math.sqrt(p0)
            b = math.sqrt(1-p0)
            amplitudes = {}
            for control, amp in ((0, a), (1, b)):
                for loop in (0, 1):
                    partner = loop
                    loop_after = loop ^ control
                    key = (control, loop_after, partner)
                    amplitudes[key] = amplitudes.get(key, 0) + amp / math.sqrt(2)
            projected = []
            for control in (0, 1):
                projected.append((amplitudes.get((control,0,0),0) +
                                  amplitudes.get((control,1,1),0)) / math.sqrt(2))
            p_success = sum(x*x for x in projected)
            self.assertAlmostEqual(p_success, postselected_cnot(p0)["success_probability"], places=12)


class EvidenceIntegrityTests(unittest.TestCase):
    def test_constraint_evidence_records_have_sources_and_status(self):
        path = Path(__file__).resolve().parents[1] / "research" / "ctc-constraints.json"
        records = json.loads(path.read_text(encoding="utf-8"))
        entries = records["entries"]
        self.assertGreaterEqual(len(entries), 6)
        self.assertEqual(len({x["id"] for x in entries}), len(entries))
        expected = {"mathematical-model", "hypothetical-physical-mechanism",
                    "conjecture-not-theorem", "illustrative-toy-model"}
        for record in entries:
            with self.subTest(record=record["id"]):
                self.assertIn(record["status"], expected)
                self.assertTrue(record["obstacles"])
                self.assertTrue(record["assumptions"])
                self.assertTrue(record["energy"])
                self.assertTrue(record["next_check"])
                self.assertTrue(record["sources"])
                self.assertTrue(all(url.startswith("https://") for url in record["sources"]))


if __name__ == "__main__":
    unittest.main()
