
function channelModeToConst (chan) {
  switch (true) {
    case chan.readable && chan.writable && chan.emitable:
    return 'READWRITEEMIT';

    case chan.readable && chan.writable:
    return 'READWRITE';

    case chan.readable && chan.emitable:
    return 'READEMIT';

    case chan.writable && chan.emitable:
    return 'WRITEEMIT';

    case chan.readable:
    return 'READ';

    case chan.writable:
    return 'WRITE';

    case chan.emitable:
    return 'EMIT';

    default:
    return 'NA';
  }
}