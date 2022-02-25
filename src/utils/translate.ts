import LocalizedStrings from 'react-localization';
import * as translations from '../resources/translations.json';

const translationMap = new LocalizedStrings(translations);

export default function tr(text, ...values) {
  const template = text.reduce((out, val, i) => out ? `${out}\{\{${i-1}\}\}${val}` : val, false);
  const translation = translationMap[template] ?? template;
  return values.reduce((out, val, i) => out.replace(`\{\{${i}\}\}`, val.toString()), translation);
}
