import React from 'react';
import useSettingState from '../../../../hooks/useSettingState';
import { SettingIds } from '../../../../lib/constants';
import Switch from '../Switch';

const NAME = 'Allow Screenshots';
const DESCRIPTION = "Disable snapchat's screenshot prevention.";

function AllowScreenshot() {
  const [enabled, setEnabled] = useSettingState(SettingIds.ALLOW_SCREENSHOT);
  return (
    <Switch
      color="indigo"
      label={NAME}
      description={DESCRIPTION}
      checked={enabled}
      onChange={() => setEnabled(!enabled)}
    />
  );
}

export default {
  name: NAME,
  description: DESCRIPTION,
  component: AllowScreenshot,
};
