import React from "react";
import WebApp from "@twa-dev/sdk";
import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import "./App.css";
import { validate } from "@tma.js/init-data-node";

// import { createHmac } from 'crypto';

type UserInfo = {
  tgId?: number;
  tgUserName?: string;
  invitedBy?: string;
};

function App() {
  const [count, setCount] = React.useState(0);
  const [userInfo, setUserInfo] = React.useState<UserInfo>({});
  const [allRefCode, setAllRefCode] = React.useState("");

  const [initDataQuery, setInitDataQuery] = React.useState("");

  const [validateErr, setValidateErr] = React.useState<any>(undefined);

  const counterHandler = () => {
    const randomValue = 1 + Math.floor(Math.random() * 10);
    setCount((count) => count + randomValue);
  };

  React.useEffect(() => {
    const initData = WebApp?.initDataUnsafe;
    const tgId = initData?.user?.id;
    const tgUserName = initData?.user?.username;
    const invitedBy = initData?.start_param;

    if (tgId) {
      setUserInfo({
        tgId,
        tgUserName,
        invitedBy,
      });
    }
  }, [WebApp?.initDataUnsafe]);

  const getAllRef = async () => {
    // const rs = await apiService.reference?.getAllReference();
    // console.log("rs: ", rs);

    // !!rs && setAllRefCode(JSON.stringify(rs));
  };

  const saveRefCode = async () => {
    // if (userInfo && userInfo.tgId && userInfo.invitedBy) {
    //   const rs = await apiService.reference?.saveRefCode(userInfo.tgId?.toString(), userInfo.invitedBy);
    //   if (rs) {
    //     WebApp.showPopup({
    //       title: "Save Ref Code",
    //       message: "SUCCESS",
    //     });
    //   } else {
    //     WebApp.showPopup({
    //       title: "Save Ref Code",
    //       message: "FAIL",
    //     });
    //   }
    // } else {
    //   // Prompt error
    //   console.log("saveRefCode --- Wrong input data");
    // }
  };

  const validateInitData = () => {
    /*
    Function will throw an error in one of these cases:
    - auth_date should present integer
    - auth_date is empty or not found
    - hash is empty or not found
    - Signature is invalid
    - Init data expired
    */
    try {
      const secretToken = "6884381091:AAFoEWqxT2NvaWP4zSu7CsGKpCXt6WhZ8j4"; //import.meta.env.VITE_TELE_SECRET_TOKEN;
      const initData = WebApp?.initDataUnsafe;
      // const initData = {"query_id":"AAHYMohKAAAAANgyiErugAQg","user":{"id":1250439896,"first_name":"Austin","last_name":"Vu","username":"AusVu1308","language_code":"en","allows_write_to_pm":true},"auth_date":"1709304003","hash":"db081850cd624efaf97624a8d1ca171830e9fb6053035c4031233a6b17a97680"}

      let initDataQueryString = objectToQueryString(initData);

      // console.log('initDataQueryString: ', initDataQueryString)

      setInitDataQuery(initDataQueryString);

      // console.log('initDataQueryString: ', initDataQueryString)

      validate(initDataQueryString, secretToken);
      // validateInitDataFromTelePlugin(initDataQueryString, secretToken, {expiresIn: 0});
      console.log("Successfully !!!");

      setValidateErr({ message: "None ERR - PASSED!!!" });

      return true;
    } catch (error) {
      // @ts-ignore
      console.log("ERR - validateInitData: ", error?.message);
      console.log("ERR - validateInitData 2: ", JSON.stringify(error));

      setValidateErr(error);
      return false;
    }
  };

  // function validateInitDataFromTelePlugin(
  //   sp: string | URLSearchParams,
  //   token: string,
  //   options: ValidateOptions = {},
  // ): void {
  //   const searchParams = typeof sp === 'string' ? new URLSearchParams(sp) : sp;

  //   // Init data creation time.
  //   let authDate = new Date(0);

  //   // Init data sign.
  //   let hash = '';

  //   // All search params pairs presented as `k=v`.
  //   const pairs: string[] = [];

  //   // Iterate over all key-value pairs of parsed parameters and find required
  //   // parameters.
  //   searchParams.forEach((value, key) => {
  //     if (key === 'hash') {
  //       hash = value;
  //       return;
  //     }

  //     if (key === 'auth_date') {
  //       const authDateNum = parseInt(value, 10);

  //       if (Number.isNaN(authDateNum)) {
  //         throw new TypeError('"auth_date" should present integer');
  //       }
  //       authDate = new Date(authDateNum * 1000);
  //     }

  //     // Append new pair.
  //     pairs.push(`${key}=${value}`);
  //   });

  //   // Hash and auth date always required.
  //   if (hash.length === 0) {
  //     throw new Error('"hash" is empty or not found');
  //   }

  //   if (authDate.getTime() === 0) {
  //     throw new Error('"auth_date" is empty or not found');
  //   }

  //   // In case, expiration time passed, we do additional parameters check.
  //   const { expiresIn = 86400 } = options;

  //   if (expiresIn > 0) {
  //     // Check if init data expired.
  //     if (authDate.getTime() + expiresIn * 1000 < new Date().getTime()) {
  //       throw new Error('Init data expired');
  //     }
  //   }

  //   // According to docs, we sort all the pairs in alphabetical order.
  //   pairs.sort();

  //   // Compute sign.
  //   const computedHash = createHmac(
  //     'sha256',
  //     createHmac('sha256', 'WebAppData').update(token).digest(),
  //   )
  //     .update(pairs.join('\n'))
  //     .digest()
  //     .toString('hex');

  //   // In case, our sign is not equal to found one, we should throw an error.
  //   if (computedHash !== hash) {
  //     throw new Error('Signature is invalid');
  //   }
  // }

  function objectToQueryString(obj: any) {
    /*
      query_id: string
      user: {
        id: number,
        first_name: string,
        last_name: string,
        username: string
        allows_write_to_pm: boolean
        language_code: string
      }
      hash: string
      auth_date: string
    */

    // for (let key of Object.keys(obj)) {
    //   console.log('key: ', key);

    //   if (!initDataQueryString) {
    //     initDataQueryString = `${key}=${(obj as any)[key]}`
    //     continue;
    //   }

    //   if(key == 'user') {
    //     initDataQueryString = initDataQueryString.concat(`&${key}=${encodeURIComponent(JSON.stringify((obj as any)[key]))}`)
    //   } else {
    //     initDataQueryString = initDataQueryString.concat(`&${key}=${(obj as any)[key]}`)
    //   }
    // }

    const keyValuePairs = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value == "object") {
          keyValuePairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`);
        } else {
          keyValuePairs.push(`${encodeURIComponent(key)}=${value}`);
        }
      }
    }
    return keyValuePairs.join("&");
  }

  return (
    <>
      <h1>Telegram mini games v3</h1>
      <div className="card">
        <button onClick={getAllRef}>Call Get All Ref API</button>
        <br />
        <button onClick={saveRefCode}>Call Add Ref API</button>
        <br />
        <button onClick={validateInitData}>Validate Init Data</button>
        <br />
        <p>
          <label>Telegram ID: {userInfo.tgId || "..."}</label>
        </p>
        <p>
          <label>Telegram User Name: {userInfo.tgUserName || "..."}</label>
        </p>
        <p>
          <label>Telegram Invited ID: {userInfo.invitedBy || "..."}</label>
        </p>
        <p>
          <label>Init Data: {JSON.stringify(WebApp?.initDataUnsafe)}</label>
        </p>
        <p>
          <label>Init Data Query: {`${initDataQuery}`}</label>
        </p>
        <p>
          <br />
          <label>ERR Validation - Init Data: {`${JSON.stringify(validateErr || "...")}`}</label>
          <br />
          <label>{` ERROR MSG ${validateErr?.message || "..."}`}</label>
          <br />
        </p>
        <p>
          <label>All Ref Code: {allRefCode}</label>
        </p>
      </div>
      <div className="card">
        <button className="btn btn-primary" onClick={counterHandler}>
          Click to add random 1-10
        </button>
        <br />
        <p>
          <label>Total is {count}</label>
        </p>
      </div>
      <div className="card-flex-center">
        <TonConnectButton />
      </div>
    </>
  );
}

export default App;
