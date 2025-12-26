export const checkProofServerStatus = async (
  proverServerUri: string | undefined
): Promise<boolean> => {
  try {
    if (!proverServerUri) return false;
    const response = await fetch(proverServerUri);
    if (!response.ok) {
      return false;
    }

    // const text = await response.text();
    // console.log({text})
    // if (text.includes("We're alive 🎉!")) {
    //   return true;
    // }
    // return false;

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
