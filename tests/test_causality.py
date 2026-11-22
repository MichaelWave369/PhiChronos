import unittest

from phichronos.causality import classify_interval, proper_time_seconds
from phichronos.relativity import C


class CausalityTests(unittest.TestCase):
    def test_timelike_same_place(self):
        self.assertEqual(classify_interval(1, 0), "timelike")
        self.assertAlmostEqual(proper_time_seconds(1, 0), 1)

    def test_lightlike(self):
        self.assertEqual(classify_interval(1, C), "lightlike")
        self.assertEqual(proper_time_seconds(1, C), 0)

    def test_spacelike(self):
        self.assertEqual(classify_interval(1, 2*C), "spacelike")
        with self.assertRaises(ValueError):
            proper_time_seconds(1, 2*C)

    def test_timelike_motion(self):
        self.assertAlmostEqual(proper_time_seconds(1, 0.6*C), 0.8, places=12)

    def test_reject_nonfinite(self):
        with self.assertRaises(ValueError):
            classify_interval(float("nan"), 0)

    def test_zero_interval(self):
        self.assertEqual(classify_interval(0, 0), "lightlike")


if __name__ == "__main__":
    unittest.main()
