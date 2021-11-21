
export const calculateMovingAverage = (timeSeries, average: number) => {
    const averages = timeSeries.map((t, idx) => idx < average ?
        Math.round(timeSeries.slice(0, idx).reduce((acc, obj) => acc + obj, 0) / (idx)) :
        Math.round(timeSeries.slice(idx - average, idx).reduce((acc, obj) => acc + obj, 0) / average)
    )
    return averages
}