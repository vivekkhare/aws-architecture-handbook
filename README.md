# AWS Architecture Handbook and Exam Centre

An unofficial, single-file study guide for designing on AWS and preparing for the
AWS Certified Solutions Architect exams (Associate, SAA-C03, and Professional, SAP-C03).

**This project is not affiliated with, endorsed by or reviewed by Amazon Web Services.**
AWS and its service names are trademarks of Amazon.com, Inc. or its affiliates.

## What is in it

- 229 service entries on one template: what it is, when not to use it, cost drivers, common mistakes, exam relevance
- 20 concept pages, 19 architecture walkthroughs with diagrams, 29 comparison tables
- 181 original practice questions, timed mock exams, study notes for every exam task statement
- Flashcards with spaced repetition, decision cues, a CIDR calculator, checklists and troubleshooting notes
- A worked example: a New Zealand payments platform, from git push to production

Everything runs in the browser from `index.html`. There are no external requests, and progress is
stored only in your own browser.

## How far to trust it

- Exam domains, task statements and in-scope service lists were taken from the AWS exam guides on 18 November 2026.
- Explanations were written from general AWS knowledge and were **not** checked line by line against AWS documentation.
- Statements marked "Verify" could not be confirmed. AWS changes often: check the official documentation before relying on a detail.
- Practice questions are original. None is a real exam question.

## Build

```
python3 build.py
cp dist/aws-handbook.html index.html
```

`build.py` inlines the files in `src/` into one HTML file.
