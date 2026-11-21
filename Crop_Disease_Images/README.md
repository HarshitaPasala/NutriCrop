---
license: cc-by-4.0
task_categories:
  - image-classification
language:
  - en
tags:
  - agriculture
  - crop-disease
  - pest-detection
  - plant-pathology
  - expert-annotations
  - india
size_categories:
  - 1K<n<10K
configs:
  - config_name: default
    data_files:
      - split: train
        path: annotations.parquet
---

# Crop Disease Expert Annotations

1,026 expert annotations over 989 crop photographs, covering pests, diseases and nutrient deficiencies across 74 crop types. The images are included in this repository.

Every image is a photo taken by a smallholder farmer on their own plot and sent to [Farmer.Chat](https://farmerchat.digitalgreen.org/), an AI advisory service run by [Digital Green](https://www.digitalgreen.org/). Agronomists then reviewed each photo on Digital Green's annotation platform. Nothing here is scraped, staged, or lab-photographed.

## Contents

- `images/` - 989 JPEG files, named `00001.jpg` upward
- `annotations.parquet` - the annotations, one row per expert review
- `annotations.csv` - the same table as CSV

| Column | Description |
|--------|-------------|
| `image_file` | Path to the image within this repository |
| `crop` | Crop or plant identified by the expert |
| `diagnosis` | Pest, disease, or nutrient deficiency name(s); `Healthy` if none |
| `details` | Expert's observations on visible symptoms |
| `country` | Country the farmer who sent the photo is registered in |
| `state` | State or province the farmer is registered in |

Multiple diagnoses per image are semicolon-separated.

## Usage

```python
from datasets import load_dataset
from huggingface_hub import snapshot_download

ds = load_dataset("DigiGreen/Crop_Disease_Images", split="train")
root = snapshot_download("DigiGreen/Crop_Disease_Images", repo_type="dataset")

row = ds[0]
print(row["crop"], row["diagnosis"])
image_path = f'{root}/{row["image_file"]}'
```

## Stats

| | Count |
|---|------:|
| Total annotations | 1,026 |
| Distinct images | 989 |
| Diseased | 723 |
| Healthy | 303 |
| Unique crops | 74 |

37 images were reviewed by more than one expert, which is why the row count exceeds the image count.

## Geographic Coverage

Photos were taken between **2 December 2024 and 30 March 2025**, which is India's Rabi (winter) season. Counts below are distinct images.

| Country | State | Images |
|---------|-------|-------:|
| India | Bihar | 738 |
| India | Andhra Pradesh | 161 |
| India | Telangana | 36 |
| India | Jharkhand | 21 |
| India | Odisha | 17 |
| India | Uttar Pradesh | 5 |
| India | Karnataka | 3 |
| Ethiopia | Addis Ababa | 1 |
| India | Gujarat | 1 |
| India | Haryana | 1 |
| India | Kerala | 1 |
| India | Madhya Pradesh | 1 |
| India | Maharashtra | 1 |
| India | Rajasthan | 1 |
| India | West Bengal | 1 |

India accounts for 988 of 989 images (99.9%) across 14 states, with Bihar alone at 75%. Farmer.Chat also operates in Ethiopia, Kenya and Nigeria, but this expert-review batch was drawn almost entirely from India.

`country` and `state` come from the registered location of the farmer who sent the photo, so they say where that person farms. Finer administrative levels are withheld, because several states here contain a single image and a district would identify an individual farm.

## Privacy

Every image was reviewed for personal information before publication, by two vision models independently plus a human pass over every case where the two disagreed. Images were removed where they contained a person's face, a name or phone number, a chat screenshot, or a location stamped into the picture by the camera app the farmer used.

64 images were removed on those grounds. Some camera apps overlay the capture coordinates, village name and date onto the photo, which is far more precise than the state-level location published here, so those images were dropped rather than cropped. Screening reduces this risk but does not eliminate it: a faint or partly legible stamp may remain. If you find one, please open a discussion and it will be removed.

Earlier versions of this dataset delivered images as links to a cloud storage bucket, and the filenames in those links carried an internal message identifier. Both are gone. Images are now served from this repository under sequential filenames that carry no information about the farmer, the conversation, or the original record.

The images carry no EXIF metadata. Farmer and reviewer identities are not included, and no free-text farmer message is published.

## Changelog

**July 2026.** Images moved into the repository as `images/00001.jpg` upward and the `image_url` column was replaced by `image_file`. Code that read `image_url` needs updating. Ran a full privacy screen over every image and removed 64 that carried personal information; four rare diagnosis labels had only one image each and went with them.

**Earlier in July 2026.** Added `country` and `state`.

### Top 10 Crops

| Crop | Count |
|------|------:|
| Chilli | 124 |
| Potato | 102 |
| Brinjal | 87 |
| Maize | 77 |
| Mango | 65 |
| Tomato | 48 |
| Papaya | 44 |
| Wheat | 39 |
| Mustard | 34 |
| Bean | 32 |

### Top 10 Diagnoses

| Diagnosis | Count |
|-----------|------:|
| Healthy | 303 |
| Leaf Curl Virus | 82 |
| Thrips | 67 |
| Aphids | 58 |
| Fall Armyworm | 52 |
| Powdery Mildew | 48 |
| Mites | 47 |
| Shoot and Fruit Borer | 33 |
| Anthracnose | 32 |
| Mosaic Virus | 25 |

## Source

Annotations were collected by [Digital Green](https://www.digitalgreen.org/) as part of the [Farmer.Chat](https://farmerchat.digitalgreen.org/) project, an AI-powered agricultural advisory platform serving smallholder farmers.

## License

This dataset is released under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/). You are free to share and adapt the data for any purpose, provided you give appropriate credit to Digital Green.

### Citation

```bibtex
@dataset{digigreen_crop_disease_2026,
  title={Crop Disease Expert Annotations},
  author={Digital Green},
  year={2026},
  url={https://huggingface.co/datasets/DigiGreen/Crop_Disease_Images},
  license={CC-BY-4.0}
}
```
