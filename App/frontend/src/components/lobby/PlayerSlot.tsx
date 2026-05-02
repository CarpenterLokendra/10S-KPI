interface PlayerSlotProps {
  username?: string
  isCreator?: boolean
  isEmpty?: boolean
  isYou?: boolean
}

export default function PlayerSlot({
  username,
  isCreator = false,
  isEmpty = false,
  isYou = false,
}: PlayerSlotProps) {
  if (isEmpty) {
    return (
      <div className="card-base flex items-center justify-center h-24 border-2 border-dashed border-gray-600">
        <p className="text-text-muted text-sm">Empty Slot</p>
      </div>
    )
  }

  return (
    <div className="card-base">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-semibold text-text-primary">{username}</p>
            {isYou && <p className="text-xs text-blue-500 font-semibold">You</p>}
          </div>
          {isCreator && (
            <span className="text-xs bg-gold-500 text-bg-base px-2 py-1 rounded font-semibold">
              Creator
            </span>
          )}
        </div>
        <div className="h-1 bg-green-500 rounded"></div>
        <p className="text-xs text-text-muted">Ready</p>
      </div>
    </div>
  )
}
