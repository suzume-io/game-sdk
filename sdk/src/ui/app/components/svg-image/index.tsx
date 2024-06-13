const SVGImage = (props: { src: string; width: number; height: number }) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: props.src }}
      style={{
        width: props.width,
        height: props.height,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    />
  );
};

export default SVGImage;
