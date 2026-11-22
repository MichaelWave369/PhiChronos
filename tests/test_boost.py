import unittest

from phichronos.boost import (
    causal_region, event_separation, lorentz_boost, minkowski_interval_m2,
)
from phichronos.relativity import C


class LorentzBoostTests(unittest.TestCase):
    def test_identity(self):
        self.assertEqual(lorentz_boost(2.0, 15.0, 0.0), (2.0, 15.0))

    def test_moving_origin_has_xprime_zero(self):
        beta = 0.6
        tp, xp = lorentz_boost(5.0, beta * C * 5.0, beta)
        self.assertAlmostEqual(xp, 0.0, delta=1e-6)
        self.assertAlmostEqual(tp, 4.0, places=12)

    def test_time_on_simultaneity_slice(self):
        beta = 0.4
        x = 2 * C
        t = beta * x / C
        tp, xp = lorentz_boost(t, x, beta)
        self.assertAlmostEqual(tp, 0.0, places=12)
        self.assertGreater(xp, 0)

    def test_round_trip_inverse(self):
        for beta in (-0.95, -0.6, 0.0, 0.6, 0.95):
            for t, x in ((1.0, 0.2*C), (3.0, 2*C), (-1.0, 4*C)):
                with self.subTest(beta=beta, t=t, x=x):
                    tp, xp = lorentz_boost(t, x, beta)
                    t2, x2 = lorentz_boost(tp, xp, -beta)
                    self.assertAlmostEqual(t2, t, delta=1e-11)
                    self.assertAlmostEqual(x2, x, delta=1e-5)

    def test_interval_invariance_for_event_pairs(self):
        pairs = [((0, 0), (3, 0.5*C)), ((-1, -C), (2, C)),
                 ((0, 0), (1, C)), ((0, 0), (1, 2*C))]
        for a, b in pairs:
            original_dt, original_dx = event_separation(a, b)
            original = minkowski_interval_m2(original_dt, original_dx)
            for beta in (-0.9, -0.5, 0, 0.5, 0.9):
                with self.subTest(a=a, b=b, beta=beta):
                    ap, bp = lorentz_boost(*a, beta), lorentz_boost(*b, beta)
                    dtp, dxp = event_separation(ap, bp)
                    transformed = minkowski_interval_m2(dtp, dxp)
                    scale = max((C * original_dt)**2, original_dx**2, 1.0)
                    self.assertLessEqual(abs(transformed-original), scale*2e-12)

    def test_causal_region(self):
        self.assertEqual(causal_region(0, 0), "coincident")
        self.assertEqual(causal_region(2, 0), "future timelike")
        self.assertEqual(causal_region(-2, 0), "past timelike")
        self.assertEqual(causal_region(2, 2*C), "future light cone")
        self.assertEqual(causal_region(-2, 2*C), "past light cone")
        self.assertEqual(causal_region(1, 2*C), "elsewhere (spacelike)")

    def test_spacelike_order_may_change_between_frames(self):
        tp, xp = lorentz_boost(0.0, C, 0.5)
        self.assertLess(tp, 0.0)
        self.assertGreater(xp, 0.0)
        self.assertEqual(causal_region(tp, xp), "elsewhere (spacelike)")

    def test_reject_bad_inputs(self):
        for beta in (-1, 1, float("nan"), float("inf")):
            with self.subTest(beta=beta), self.assertRaises(ValueError):
                lorentz_boost(1, 0, beta)
        with self.assertRaises(ValueError):
            lorentz_boost(float("nan"), 0, 0.5)
        with self.assertRaises(ValueError):
            minkowski_interval_m2(float("inf"), 5)
        with self.assertRaises(ValueError):
            event_separation((0,), (1, 2))

    def test_signed_intervals(self):
        self.assertEqual(minkowski_interval_m2(1, C), 0)
        self.assertGreater(minkowski_interval_m2(2, C), 0)
        self.assertLess(minkowski_interval_m2(1, 2*C), 0)


if __name__ == "__main__":
    unittest.main()
