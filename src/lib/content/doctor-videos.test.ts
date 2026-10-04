import { describe, expect, it } from "vitest";
import {
  selectDoctorVideos,
  type DoctorVideoMapEntry,
  type GeneratedVideo,
} from "./doctor-videos";

/*
  The gates around a doctor's video, tested.

  These are the rules the client's own list sets: the doctor appears next to a
  product by name, so the clip needs his written consent on file, and only
  over-the-counter products may carry one. A regression here publishes a
  medical endorsement nobody agreed to, which is not something a reviewer would
  catch by looking at the page — so it is caught here instead.
*/

const video: GeneratedVideo = {
  id: "abc123",
  title: "Qanday qabul qilish kerak",
  url: "https://www.instagram.com/reel/abc123/",
  file: "/videos/doctor/abc123.mp4",
  poster: "/videos/doctor/abc123.jpg",
  durationSeconds: 47,
  uploadedAt: "2026-09-18",
  width: 1080,
  height: 1920,
};

const entry: DoctorVideoMapEntry = {
  productSlug: "delical-vanil-200ml",
  doctorName: "Dr. Test",
  consentOnFile: true,
  otc: true,
  caption: { uz: "Bir qator", ru: "Одна строка" },
};

describe("selectDoctorVideos", () => {
  it("publishes a clip that is mapped, consented and OTC", () => {
    const out = selectDoctorVideos([video], { abc123: entry });
    expect(out).toHaveLength(1);
    expect(out[0].videoSrc).toBe("/videos/doctor/abc123.mp4");
    expect(out[0].posterSrc).toBe("/videos/doctor/abc123.jpg");
    expect(out[0].productSlug).toBe("delical-vanil-200ml");
  });

  it("hides a clip nobody mapped to a product", () => {
    expect(selectDoctorVideos([video], {})).toHaveLength(0);
  });

  it("hides a clip whose consent is not on file", () => {
    const out = selectDoctorVideos([video], { abc123: { ...entry, consentOnFile: false } });
    expect(out).toHaveLength(0);
  });

  it("hides a clip for a prescription product", () => {
    const out = selectDoctorVideos([video], { abc123: { ...entry, otc: false } });
    expect(out).toHaveLength(0);
  });

  it("ignores a file path outside /videos/doctor", () => {
    const stray = { ...video, file: "/products/delical.webp" };
    expect(selectDoctorVideos([stray], { abc123: entry })).toHaveLength(0);
  });

  it("keeps a clip with no poster — the poster is optional", () => {
    const noPoster = { ...video, poster: null };
    const out = selectDoctorVideos([noPoster], { abc123: entry });
    expect(out).toHaveLength(1);
    expect(out[0].posterSrc).toBeNull();
  });
});
