const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
  const paddingToBottom = 100;
  return layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom;
}

export default isCloseToBottom