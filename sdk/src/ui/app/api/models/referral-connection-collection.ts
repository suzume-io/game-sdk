export type ReferralConnectionType = {
  code: string;
  userId: string;
  socalId: string;
  userName: string;
  userAvatar: string;
  firstName: string;
  lastName: string;
  label: string;
};

export default class ReferralConnectionCollection {
  public data: ReferralConnectionType[];

  constructor() {
    this.data = [];
  }

  public mergeMany(connections: any[]) {
    if (!connections) {
      return;
    }

    if (!Array.isArray(connections)) {
      this.data = [connections];
    }

    this.data = connections.map((it) => {
      const userAvatar = `https://public-szm.s3.ap-southeast-1.amazonaws.com/avatars/${it.user_social_id}.jpg`;
      let label = it.user_name;
      if (it.first_name || it.last_name) {
        label = [it.first_name, it.last_name].filter((it) => !!it).join(' ');
      }
      
      return {
        userAvatar,
        label,
        code: it.code,
        userId: it.user_id,
        socalId: it.user_social_id,
        userName: it.user_name,
        firstName: it.first_name,
        lastName: it.last_name
      };
    });
  }
}
