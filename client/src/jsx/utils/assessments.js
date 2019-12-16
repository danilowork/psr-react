export function getLastAssessments(data, limit = 2) {
  let res = [];

  // Flatten assessments tree
  data.forEach((assessment, assessmentIdx) =>
      assessment.childs && assessment.childs.forEach((cat, catIdx) =>
      cat.childs && cat.childs.forEach((subCat, subCatIdx) =>
      subCat.values && subCat.values.forEach(value =>
          res.push({
            date_assessed: value.date_assessed,
            value: value,
            subCat: subCat,
            cat: cat,
            assessment: assessment,
            subCatIdx: subCatIdx,
            catIdx: catIdx,
            assessmentIdx: assessmentIdx,
          })))));

  // Sort by `date_assessed` DESC
  res.sort((a, b) => new Date(b.date_assessed).getTime() - new Date(a.date_assessed).getTime());

  // Remove duplicates for assessmentIdx + catIdx
  res = res.reduce((acc, reduceItem) =>
          acc.find(findItem =>
              findItem.assessmentIdx === reduceItem.assessmentIdx &&
              findItem.catIdx === reduceItem.catIdx) ? acc : [...acc, reduceItem],
      []);

  res = res.slice(0, limit);
  return res;
}

export function getLastLeadershipAssessments(data) {
  let res = [];

  // Flatten assessments tree
  data.forEach((assessment, assessmentIdx) =>
      assessment.history && assessment.history.forEach(value =>
          res.push({
            date_assessed: value.date_assessed,
            value: value,
            assessment: assessment,
            assessmentIdx: assessmentIdx,
          })));

  // Sort by `date_assessed` DESC
  res.sort((a, b) => new Date(b.date_assessed).getTime() - new Date(a.date_assessed).getTime());

  // Remove duplicates for assessmentIdx + catIdx
  res = res.reduce((acc, reduceItem) =>
          acc.find(findItem =>
              findItem.assessmentIdx === reduceItem.assessmentIdx) ? acc : [...acc, reduceItem],
      []);

  return res;
}

export function hasAnyAssessments(data) {
  return data && data.length > 0 && data.find(item => {
    if (item.value)
      return true;
    if (item.length)
      return hasAnyAssessments(item);
    if (item.childs && item.childs.length > 0)
      return hasAnyAssessments(item.childs);
  })
}
