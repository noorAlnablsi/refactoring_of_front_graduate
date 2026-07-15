import i18n from '../i18n'

export const SUBJECTS_PAGE_SIZE = 3

export const SUBJECT_SORT_VALUES = ['name', 'oldest', 'newest']

export function getSubjectSortOptions() {
  return SUBJECT_SORT_VALUES.map((value) => ({
    value,
    label: i18n.t(`sort.${value}`, { ns: 'subjects', defaultValue: value }),
  }))
}

/** @deprecated Use getSubjectSortOptions() for translated labels */
export const SUBJECT_SORT_OPTIONS = getSubjectSortOptions()
