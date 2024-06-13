import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import { useApi } from '@app/api';
import Locator from '@services/locator';
import { useEffect } from 'react';
import CollectionPage from './collectible-detail';
import QuestBoardPage from './quest-board';
import { AchivementQuestTab } from './quest-board/achivements';
import { QuestBoardFeaturesTab } from './quest-board/features';
import { InvitesQuestTab } from './quest-board/invites';
import { DailyQuestTab } from './quest-board/quests';
import VaultPage from './vault';

const DEBUG = true;

const MainPage = (props: any) => {
  const { data, processMessage } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    // getApi('/vault/profile');

    console.log('--- GET VAULT');    
  }, []);

  Locator.uiEventBus.detachAll('quest-board');
  Locator.uiEventBus.on('quest-board', (message) => {
    try {
      const msg = JSON.parse(message);

      switch (msg.cmd) {
        case 'show':
          navigate(msg.data.path);
          break;
      }

      processMessage(msg);
    } catch (ex) {}
  });

  return (
    <Routes>
      <Route path="" element={<div></div>}></Route>
      <Route path="quest-board" element={<QuestBoardPage />}>
        <Route path="" element={<DailyQuestTab />}></Route>
        <Route path="daily-quests" element={<DailyQuestTab />}></Route>
        <Route path="achievements" element={<AchivementQuestTab />}></Route>
        <Route path="invites" element={<InvitesQuestTab />}></Route>
        <Route path="features" element={<QuestBoardFeaturesTab />}></Route>        
      </Route>
      <Route path="vault" element={<VaultPage />}>
        <Route path="collectibles" element={<CollectionPage />}></Route>
      </Route>
    </Routes>
  );
};

export default MainPage;
